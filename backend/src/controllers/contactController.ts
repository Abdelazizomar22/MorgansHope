import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler';
import { sendContactEmail } from '../utils/mailer';

export const contactValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email address is required'),
  body('phone').optional({ checkFalsy: true }).isString().trim().isLength({ max: 40 }),
  body('message').isString().trim().isLength({ min: 10, max: 4000 }).withMessage('Message must be between 10 and 4000 characters'),
];

export const submitContactForm = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
    });
    return;
  }

  await sendContactEmail({
    name: req.body.name.trim(),
    email: req.body.email.trim(),
    phone: req.body.phone?.trim(),
    message: req.body.message.trim(),
  });

  res.json({
    success: true,
    message: 'Your message has been sent successfully.',
  });
});
