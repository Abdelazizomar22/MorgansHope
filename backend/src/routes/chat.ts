import { Router } from 'express';
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
  [
    body('message').isString().trim().isLength({ min: 1, max: 4000 }),
    body('history').optional().isArray({ max: 12 }),
  ],
  handleSendMessage,
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
