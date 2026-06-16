import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, type AuthRequest } from '../middleware/auth';
import { userRateLimiter } from '../middleware/rateLimiter';
import AnalysisResult from '../models/AnalysisResult';
import ChatMessage from '../models/ChatMessage';
import User from '../models/User';
import { generateChatReply, type ChatTurn } from '../utils/chatAgent';
import { getChatQueue } from '../queues/chat.queue';

const router = Router();

const chatLimit = userRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many chat requests, please try again later.' });

type UserInstance = InstanceType<typeof User>;

async function processChatSync(
  userId: number,
  message: string,
  history: ChatTurn[],
  latestAnalysis: InstanceType<typeof AnalysisResult> | null,
  user: UserInstance,
): Promise<string> {
  const reply = await generateChatReply({ message, history, user, latestAnalysis });

  await ChatMessage.create({
    userId,
    role: 'assistant',
    content: reply.slice(0, 4000),
  });

  const totalMessages = await ChatMessage.count({ where: { userId } });
  if (totalMessages > 30) {
    const staleMessages = await ChatMessage.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
      limit: totalMessages - 30,
    });

    if (staleMessages.length) {
      await ChatMessage.destroy({
        where: { id: staleMessages.map((m) => m.id) },
      });
    }
  }

  return reply;
}

import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { handleSendMessage, handleGetHistory } from '../controllers/chatController';

const router = Router();

/**
 * @openapi
 * /api/chat:
 *   post:
 *     tags: [Chat]
 *     summary: Send a message to the AI medical assistant
 *     description: The assistant has context of the user's profile, latest analysis results, and conversation history. Supports bilingual English/Arabic responses.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatInput'
 *     responses:
 *       200:
 *         description: AI reply generated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         reply: { type: string }
 *                         usedLatestAnalysis: { type: boolean }
 *                         memoryTurnsUsed: { type: integer }
 *       400:
 *         description: Invalid chat payload
 */
router.post(
  '/',
  authenticate,
  chatLimit,
  [
    body('message').isString().trim().isLength({ min: 1, max: 4000 }),
    body('history').optional().isArray({ max: 12 }),
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat payload',
        errors: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const message = String(req.body.message || '');
    const rawHistory = Array.isArray(req.body.history) ? req.body.history : [];
    const requestHistory: ChatTurn[] = rawHistory
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .map((item) => ({ role: item.role, content: item.content.slice(0, 4000) }));

    const userMsg = await ChatMessage.create({
      userId: req.user.id,
      role: 'user',
      content: message.slice(0, 4000),
    });

    try {
      const queue = getChatQueue();
      await queue.add('reply', { userMessageId: userMsg.id, userId: req.user.id });
      return res.json({
        success: true,
        data: {
          messageId: userMsg.id,
          status: 'processing' as const,
        },
      });
    } catch (err) {
      console.warn('[Chat] Queue unavailable, processing synchronously:', err);

      const storedMessages = await ChatMessage.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 12,
      });

      const dbHistory: ChatTurn[] = storedMessages
        .filter((m) => m.id !== userMsg.id)
        .reverse()
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const mergedHistoryMap = new Map<string, ChatTurn>();
      [...dbHistory, ...requestHistory].forEach((item) => {
        const key = `${item.role}:${item.content.trim()}`;
        if (!mergedHistoryMap.has(key)) {
          mergedHistoryMap.set(key, item);
        }
      });

      const history = Array.from(mergedHistoryMap.values()).slice(-12);

      const latestAnalysis = await AnalysisResult.findOne({
        where: { userId: req.user.id, status: 'completed' },
        order: [['createdAt', 'DESC']],
      });

      const reply = await processChatSync(
        req.user.id,
        message,
        history,
        latestAnalysis,
        req.user,
      );

      return res.json({
        success: true,
        data: {
          messageId: userMsg.id,
          reply,
          usedLatestAnalysis: Boolean(latestAnalysis),
          memoryTurnsUsed: history.length,
          status: 'completed',
        },
      });
    }
  },
);

/**
 * @openapi
 * /api/chat/history:
 *   get:
 *     tags: [Chat]
 *     summary: Get chat message history
 *     description: Returns up to 100 most recent messages in chronological order.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Chat history retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           role: { type: string, enum: [user, assistant] }
 *                           content: { type: string }
 *                           createdAt: { type: string, format: date-time }
 */
router.get('/history', authenticate, handleGetHistory);

export default router;
