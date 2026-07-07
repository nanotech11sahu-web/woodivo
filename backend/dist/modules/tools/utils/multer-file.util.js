"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToMulterFile = bufferToMulterFile;
exports.mimeFromExtension = mimeFromExtension;
function bufferToMulterFile(buffer, originalname, mimetype = 'application/octet-stream') {
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
        stream: undefined,
    };
}
const EXT_TO_MIME = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.gif': 'image/gif',
};
function mimeFromExtension(filename) {
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    return EXT_TO_MIME[ext] ?? 'application/octet-stream';
}
//# sourceMappingURL=multer-file.util.js.map