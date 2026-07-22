export interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    size: number;
}
export declare class UploadService {
    uploadProfilePhoto(fileBuffer: Buffer, userId: string, _mimeType: string): Promise<UploadResult>;
    deletePhoto(publicId: string): Promise<void>;
    uploadVoiceNote(fileBuffer: Buffer, conversationId: string): Promise<UploadResult>;
}
//# sourceMappingURL=upload.service.d.ts.map