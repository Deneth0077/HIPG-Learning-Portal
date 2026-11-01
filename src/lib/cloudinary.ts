import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'hipg_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'hipg_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'hipg_secret',
  secure: true,
});

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string = 'hipg_learning_portal'
): Promise<CloudinaryUploadResult> {
  // If running with mock/unconfigured credentials, provide safe mock response
  if (
    !process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_API_SECRET === 'your_cloudinary_api_secret' ||
    process.env.CLOUDINARY_API_SECRET === 'mock_secret'
  ) {
    const mockId = `${folder}/img_${Date.now()}`;
    return {
      publicId: mockId,
      secureUrl: `https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80`,
      format: 'jpg',
      width: 1200,
      height: 800,
    };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        }
      )
      .end(buffer);
  });
}

export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  if (
    !process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_API_SECRET === 'your_cloudinary_api_secret' ||
    process.env.CLOUDINARY_API_SECRET === 'mock_secret'
  ) {
    return true;
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch {
    return false;
  }
}
