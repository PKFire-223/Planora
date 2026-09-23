import { FileAttachment } from '../types';

/**
 * Format bytes to human readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Categorize file based on MIME type or extension
 */
export function categorizeFile(file: File | { name: string; type?: string }): FileAttachment['category'] {
  const mime = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();

  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(name)) {
    return 'image';
  }
  if (mime.includes('presentation') || mime.includes('powerpoint') || /\.(pptx?|key|odp)$/.test(name)) {
    return 'slide';
  }
  if (
    mime.includes('pdf') ||
    mime.includes('word') ||
    mime.includes('document') ||
    mime.includes('sheet') ||
    mime.includes('excel') ||
    /\.(pdf|docx?|txt|rtf|odt|xlsx?|csv)$/.test(name)
  ) {
    return 'document';
  }
  if (
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    mime.includes('json') ||
    mime.includes('html') ||
    mime.includes('css') ||
    /\.(ts|tsx|js|jsx|json|html|css|py|java|cpp|c|cs|go|rs|sql|md)$/.test(name)
  ) {
    return 'code';
  }
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('compressed') || /\.(zip|rar|7z|tar|gz)$/.test(name)) {
    return 'archive';
  }
  return 'other';
}

/**
 * Convert a File object to an optimized Data URL
 * Compresses images if they exceed target dimensions to keep storage clean
 */
export async function fileToDataUrl(file: File, maxDimension: number = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an image, optimize through canvas
    if (file.type.startsWith('image/') && !file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const quality = file.type === 'image/png' ? 0.9 : 0.85;
            resolve(canvas.toDataURL(file.type || 'image/jpeg', quality));
            return;
          }
          resolve(e.target?.result as string);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      // Direct FileReader for PDFs, documents, text, code, etc.
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Process and upload file either to backend /api/upload or generate resilient client storage
 */
export async function processAndUploadFile(file: File): Promise<FileAttachment> {
  const dataUrl = await fileToDataUrl(file);
  const category = categorizeFile(file);
  const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Attempt backend API upload if running
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
        category
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.file) {
        return data.file;
      }
    }
  } catch {
    // Fallback to client base64 storage
  }

  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    url: dataUrl,
    uploadedAt: new Date().toISOString(),
    category
  };
}
