import { v2 as cloudinary } from 'cloudinary';
import { config } from '@config/index';
import { Readable } from 'stream';
import logger from '@utils/logger';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  size: number;
}

export class UploadService {
  async uploadProfilePhoto(
    fileBuffer: Buffer,
    userId: string,
    _mimeType: string
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `soulmate-sync/profiles/${userId}`,
          upload_preset: config.cloudinary.uploadPreset,
          transformation: [
            { width: 800, height: 800, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        },
        (error, result) => {
          if (error || !result) {
            logger.error('Cloudinary upload error', error);
            reject(new Error('Failed to upload photo'));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              size: result.bytes,
            });
          }
        }
      );

      const readable = new Readable();
      readable.push(fileBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async deletePhoto(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      logger.error('Cloudinary delete error', err);
    }
  }

  async uploadVoiceNote(fileBuffer: Buffer, conversationId: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `soulmate-sync/voice-notes/${conversationId}`,
          resource_type: 'video', // Cloudinary uses 'video' for audio
          allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'webm'],
        },
        (error, result) => {
          if (error || !result) {
            reject(new Error('Failed to upload voice note'));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: 0,
              height: 0,
              size: result.bytes,
            });
          }
        }
      );

      const readable = new Readable();
      readable.push(fileBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
