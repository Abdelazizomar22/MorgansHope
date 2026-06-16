import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

const isVercel = Boolean(process.env.VERCEL);
const uploadsRoot = process.env.UPLOAD_DIR || 'uploads';
const uploadDir = isVercel
  ? path.join(os.tmpdir(), 'morgans-hope-uploads')
  : path.isAbsolute(uploadsRoot)
    ? uploadsRoot
    : path.join(process.cwd(), uploadsRoot);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
