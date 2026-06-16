import crypto from 'crypto';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Media from '../models/Media';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

const ALLOWED_MEDIA_TYPES = ['image', 'video', 'audio', 'raw'];
const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'];
const ALLOWED_VIDEO_TYPES = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'];
const ALLOWED_AUDIO_TYPES = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
const ALLOWED_RAW_TYPES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'zip'];

const ALLOWED_TYPES: Record<string, string[]> = {
  image: ALLOWED_IMAGE_TYPES,
  video: ALLOWED_VIDEO_TYPES,
  audio: ALLOWED_AUDIO_TYPES,
  raw: ALLOWED_RAW_TYPES,
};

const MAX_FILE_SIZES: Record<string, number> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  audio: 50 * 1024 * 1024,
  raw: 20 * 1024 * 1024,
};

export async function requestSignature(req: AuthRequest, res: Response): Promise<void> {
  const { mediaType, fileType, fileSize } = req.body;

  if (!mediaType || !fileType || fileSize == null) {
    res.status(400).json({ success: false, message: 'mediaType, fileType, and fileSize are required' });
    return;
  }

  const normalizedType = (mediaType as string).toLowerCase();
  if (!ALLOWED_MEDIA_TYPES.includes(normalizedType)) {
    res.status(400).json({ success: false, message: `Unsupported media type: ${mediaType}` });
    return;
  }

  const normalizedExt = (fileType as string).toLowerCase().replace(/^\./, '');
  const allowedExts = ALLOWED_TYPES[normalizedType];
  if (!allowedExts.includes(normalizedExt)) {
    res.status(400).json({ success: false, message: `Unsupported file extension: .${normalizedExt} for ${normalizedType}` });
    return;
  }

  const maxSize = MAX_FILE_SIZES[normalizedType];
  if (Number(fileSize) > maxSize) {
    res.status(400).json({ success: false, message: `File too large. Maximum for ${normalizedType} is ${maxSize / 1024 / 1024}MB` });
    return;
  }

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    res.status(500).json({ success: false, message: 'Cloudinary not configured' });
    return;
  }

  const folder = `morgans-hope/${normalizedType}`;
  const publicId = `${folder}/${req.user!.id}/${crypto.randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000);

  const params: Record<string, string | number> = {
    folder,
    public_id: publicId,
    timestamp,
  };

  if (['image', 'video', 'audio'].includes(normalizedType)) {
    params.transformation = 'q_auto,f_auto';
  }

  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + API_SECRET;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  res.json({
    success: true,
    data: {
      signature,
      publicId,
      uploadUrl: UPLOAD_URL,
      timestamp,
      apiKey: API_KEY,
      cloudName: CLOUD_NAME,
    },
  });
}

export async function confirmUpload(req: AuthRequest, res: Response): Promise<void> {
  const { publicId, secureUrl, resourceType, fileSize, mimeType } = req.body;

  if (!publicId || !secureUrl || !resourceType) {
    res.status(400).json({ success: false, message: 'publicId, secureUrl, and resourceType are required' });
    return;
  }

  if (!secureUrl.includes('cloudinary.com')) {
    res.status(400).json({ success: false, message: 'Invalid upload destination' });
    return;
  }

  const record = await Media.create({
    userId: req.user!.id,
    publicId,
    secureUrl,
    resourceType,
    fileSize: Number(fileSize) || 0,
    mimeType: mimeType || '',
  });

  res.status(201).json({
    success: true,
    message: 'Upload confirmed',
    data: { id: record.id, secureUrl: record.secureUrl },
  });
}
