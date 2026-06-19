import fs from 'fs';
import os from 'os';
import path from 'path';

export function getUploadDirectory() {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'morgans-hope-uploads');
  }

  const configured = process.env.UPLOAD_DIR || 'uploads';
  return path.isAbsolute(configured)
    ? path.resolve(configured)
    : path.resolve(process.cwd(), configured);
}

export function resolveUploadedFile(filePath: string) {
  const safeName = path.basename(filePath);
  if (!safeName || safeName === '.' || safeName === path.sep) {
    return null;
  }
  return path.join(getUploadDirectory(), safeName);
}

export function resolveAnalysisTempFile(filePath: string) {
  const safeName = path.basename(filePath);
  if (!safeName.startsWith('morgans-hope-')) {
    return null;
  }
  return path.join(os.tmpdir(), safeName);
}

export function resolveAnalysisInputFile(filePath: string) {
  return resolveUploadedFile(filePath) || resolveAnalysisTempFile(filePath);
}

function unlinkResolved(filePath: string | null) {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch {
    // Cleanup is best-effort; the OS or storage lifecycle can remove leftovers.
  }
}

export function safeUnlinkUploadedFile(filePath: string) {
  unlinkResolved(resolveUploadedFile(filePath));
}

export function safeUnlinkAnalysisTempFile(filePath: string) {
  unlinkResolved(resolveAnalysisTempFile(filePath));
}

export function safeUnlinkAnalysisInputFile(filePath: string) {
  unlinkResolved(resolveAnalysisInputFile(filePath));
}

export function resolveStoredUpload(filename: string) {
  const safeName = path.basename(filename);
  if (!safeName || safeName === '.' || safeName === path.sep) {
    return null;
  }
  return path.join(getUploadDirectory(), safeName);
}
