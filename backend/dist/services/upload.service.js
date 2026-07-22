"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const cloudinary_1 = require("cloudinary");
const index_1 = require("@config/index");
const stream_1 = require("stream");
const logger_1 = __importDefault(require("@utils/logger"));
cloudinary_1.v2.config({
    cloud_name: index_1.config.cloudinary.cloudName,
    api_key: index_1.config.cloudinary.apiKey,
    api_secret: index_1.config.cloudinary.apiSecret,
    secure: true,
});
class UploadService {
    async uploadProfilePhoto(fileBuffer, userId, _mimeType) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: `soulmate-sync/profiles/${userId}`,
                upload_preset: index_1.config.cloudinary.uploadPreset,
                transformation: [
                    { width: 800, height: 800, crop: 'fill', gravity: 'face' },
                    { quality: 'auto', fetch_format: 'auto' },
                ],
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            }, (error, result) => {
                if (error || !result) {
                    logger_1.default.error('Cloudinary upload error', error);
                    reject(new Error('Failed to upload photo'));
                }
                else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        width: result.width,
                        height: result.height,
                        size: result.bytes,
                    });
                }
            });
            const readable = new stream_1.Readable();
            readable.push(fileBuffer);
            readable.push(null);
            readable.pipe(uploadStream);
        });
    }
    async deletePhoto(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
        }
        catch (err) {
            logger_1.default.error('Cloudinary delete error', err);
        }
    }
    async uploadVoiceNote(fileBuffer, conversationId) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: `soulmate-sync/voice-notes/${conversationId}`,
                resource_type: 'video', // Cloudinary uses 'video' for audio
                allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'webm'],
            }, (error, result) => {
                if (error || !result) {
                    reject(new Error('Failed to upload voice note'));
                }
                else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        width: 0,
                        height: 0,
                        size: result.bytes,
                    });
                }
            });
            const readable = new stream_1.Readable();
            readable.push(fileBuffer);
            readable.push(null);
            readable.pipe(uploadStream);
        });
    }
}
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map