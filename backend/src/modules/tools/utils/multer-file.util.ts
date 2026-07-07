/**
 * MediaService.uploadImage() only ever reads `file.buffer`, but its type
 * signature wants a full Express.Multer.File. Draft-blog processing reads
 * images off disk (inside an extracted zip), not off a multipart request,
 * so there's no real Multer.File to hand it. This builds a minimal one —
 * every field beyond `buffer` is a placeholder MediaService never touches.
 */
export function bufferToMulterFile(
  buffer: Buffer,
  originalname: string,
  mimetype = 'application/octet-stream',
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    mimetype,
    size: buffer.length,
    buffer,
    destination: '',
    filename: originalname,
    path: '',
    stream: undefined as unknown as Express.Multer.File['stream'],
  };
}

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

export function mimeFromExtension(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return EXT_TO_MIME[ext] ?? 'application/octet-stream';
}
