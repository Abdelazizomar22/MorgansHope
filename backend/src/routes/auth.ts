import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import {
  register, registerValidators,
  login, loginValidators,
  logout,
  refreshToken,
  me,
  updateProfile,
  uploadAvatar,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/debug', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  try {
    const count = await User.count();
    const admin = await User.findOne({ where: { email: 'admin@medtech.com' } });
    const bcrypt = await import('bcryptjs');
    const testMatch = admin ? await bcrypt.compare('Admin@123456', admin.password) : null;
    return res.json({
      success: true,
      db: 'ok',
      userCount: count,
      adminExists: !!admin,
      adminEmailInDb: admin?.email ?? null,
      testPasswordMatch: testMatch,
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, dbError: e?.message });
  }
});

router.get('/dev-setup', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  const email = 'admin@medtech.com';
  const password = 'Admin@123456';
  const hashed = await bcrypt.hash(password, 12);
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({
      firstName: 'Admin',
      lastName: 'MedTech',
      email,
      password: hashed,
      role: 'admin',
    });
    return res.json({
      success: true,
      message: 'Admin user created. Use these credentials to log in.',
      email,
      password,
    });
  }
  user.password = hashed;
  await user.save();
  return res.json({
    success: true,
    message: 'Admin password reset. Use these credentials to log in.',
    email,
    password,
  });
});

router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
