import { Err, Ok, type Result } from '../types/result';
import ChatMessage from '../models/ChatMessage';
import AnalysisResult from '../models/AnalysisResult';
import User from '../models/User';
import { generateChatReply, type ChatTurn } from '../utils/chatAgent';

interface SendMessageInput {
  userId: number;
  message: string;
  rawHistory?: ChatTurn[];
}

interface SendMessageResult {
  reply: string;
  usedLatestAnalysis: boolean;
  memoryTurnsUsed: number;
}

export async function sendMessage({
  userId,
  message,
  rawHistory = [],
}: SendMessageInput): Promise<Result<SendMessageResult>> {
  try {
    const requestHistory: ChatTurn[] = rawHistory
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .map((item) => ({ role: item.role, content: item.content.slice(0, 4000) }));

    const storedMessages = await ChatMessage.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 12,
    });

    const dbHistory: ChatTurn[] = storedMessages.reverse().map((item) => ({
      role: item.role,
      content: item.content,
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
      where: { userId, status: 'completed' },
      order: [['createdAt', 'DESC']],
    });

    await ChatMessage.create({
      userId,
      role: 'user',
      content: message.slice(0, 4000),
    });

    const user = await User.findByPk(userId);
    if (!user) {
      return Err('User not found');
    }

    const reply = await generateChatReply({
      message,
      history,
      user,
      latestAnalysis,
    });

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
          where: { id: staleMessages.map((item) => item.id) },
        });
      }
    }

    return Ok({
      reply,
      usedLatestAnalysis: Boolean(latestAnalysis),
      memoryTurnsUsed: history.length,
    });
  } catch (error) {
    console.error('Chat service error:', error);
    return Err('Failed to process chat message');
  }
}

export async function getHistory(userId: number): Promise<Result<Array<{ role: string; content: string; createdAt: Date }>>> {
  try {
    const messages = await ChatMessage.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
      limit: 100,
      attributes: ['id', 'role', 'content', 'createdAt'],
    });

    return Ok(
      messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }))
    );
  } catch (error) {
    console.error('Chat history error:', error);
    return Err('Failed to retrieve chat history');
  }
}
