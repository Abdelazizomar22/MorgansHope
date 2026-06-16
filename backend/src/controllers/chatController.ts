import { type Request, type Response } from 'express';
import { validationResult } from 'express-validator';
import type { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendMessage, getHistory } from '../services/chatService';

export const handleSendMessage = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Invalid chat payload',
      errors: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
    });
  }

  const authReq = req as AuthRequest;
  if (!authReq.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const message = String(authReq.body.message || '');
  const rawHistory = Array.isArray(authReq.body.history) ? authReq.body.history : [];

  const result = await sendMessage({ userId: authReq.user.id, message, rawHistory });

  if (result.success === false) {
    return res.status(500).json({ success: false, message: result.error });
  }

  return res.json({
    success: true,
    data: result.data,
  });
});

export const handleGetHistory = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const result = await getHistory(authReq.user.id);

  if (result.success === false) {
    return res.status(500).json({ success: false, message: result.error });
  }

  return res.json({
    success: true,
    data: result.data,
  });
});
