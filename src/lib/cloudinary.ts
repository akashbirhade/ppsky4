import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  width?: number
  height?: number
  format: string
  size: number
}

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string
    publicId?: string
    resourceType?: 'image' | 'raw' | 'auto'
    transformation?: any[]
  }
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: options.folder,
      resource_type: options.resourceType || 'auto',
    }

    if (options.publicId) {
      uploadOptions.public_id = options.publicId
    }

    if (options.transformation) {
      uploadOptions.transformation = options.transformation
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`))
          return
        }
        if (!result) {
          reject(new Error('Cloudinary upload returned no result'))
          return
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
        })
      }
    )

    uploadStream.end(buffer)
  })
}

/**
 * Upload profile photo with face-crop optimization
 */
export async function uploadProfilePhoto(
  buffer: Buffer,
  userId: string
): Promise<UploadResult> {
  return uploadToCloudinary(buffer, {
    folder: `soulmatesync/profiles/${userId}`,
    resourceType: 'image',
    transformation: [
      { width: 800, height: 800, crop: 'thumb', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  })
}

/**
 * Upload biodata document (PDF/image)
 */
export async function uploadBiodata(
  buffer: Buffer,
  userId: string,
  filename: string
): Promise<UploadResult> {
  const ext = filename.split('.').pop()?.toLowerCase()
  const resourceType = ext === 'pdf' ? 'raw' : 'image'

  return uploadToCloudinary(buffer, {
    folder: `soulmatesync/biodata/${userId}`,
    publicId: `biodata_${Date.now()}`,
    resourceType: resourceType as any,
  })
}

/**
 * Upload verification document (stored securely)
 */
export async function uploadVerificationDoc(
  buffer: Buffer,
  userId: string,
  docType: string
): Promise<UploadResult> {
  return uploadToCloudinary(buffer, {
    folder: `soulmatesync/verifications/${userId}`,
    publicId: `${docType}_${Date.now()}`,
    resourceType: 'auto',
  })
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch {
    return false
  }
}

/**
 * Generate a blurred version URL (for photo privacy)
 */
export function getBlurredUrl(url: string): string {
  // Cloudinary transformation: add blur effect
  return url.replace('/upload/', '/upload/e_blur:1000,q_30/')
}

export { cloudinary }
