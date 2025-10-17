import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dklwkp27r',
  api_key: process.env.CLOUDINARY_API_KEY || '729227874712864',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'kxu6NmnyJNWYTRdWKHZzvilvHps',
});

/**
 * Upload a file to Cloudinary
 * @param {Buffer} buffer - The file buffer
 * @param {string} originalname - The original filename
 * @returns {Promise<Object>} - The upload result
 */
export const uploadToCloudinary = async (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'medical_reports',
        public_id: `${Date.now()}_${originalname.replace(/\.[^/.]+$/, "")}`,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    // Convert buffer to stream
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object>} - The deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export default cloudinary;