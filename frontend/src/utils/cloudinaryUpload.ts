import { mediaApi } from './api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const ext = file.name.split('.').pop() || '';
  const mediaType = file.type.startsWith('video') ? 'video' : 'image';

  const signRes = await mediaApi.requestSignature({
    mediaType,
    fileType: ext,
    fileSize: file.size,
  });

  const { signature, publicId, uploadUrl, timestamp, apiKey } = signRes.data!;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('api_key', apiKey);

  let cloudinaryResult: { secure_url: string; public_id: string; resource_type: string; bytes: number; format: string };

  if (onProgress) {
    cloudinaryResult = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress({ loaded: e.loaded, total: e.total, percent: Math.round((e.loaded / e.total) * 100) });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    });
  } else {
    const res = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    cloudinaryResult = await res.json();
  }

  await mediaApi.confirmUpload({
    publicId: cloudinaryResult.public_id,
    secureUrl: cloudinaryResult.secure_url,
    resourceType: cloudinaryResult.resource_type,
    fileSize: cloudinaryResult.bytes,
    mimeType: cloudinaryResult.format,
  });

  return cloudinaryResult.secure_url;
}
