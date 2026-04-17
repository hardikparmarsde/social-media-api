import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - The file buffer from multer memoryStorage.
 * @param {object} [options] - Optional Cloudinary upload options.
 * @returns {Promise<object>} Cloudinary upload result (includes secure_url).
 */
export function uploadToCloudinary(buffer, options = {}) {
    return new Promise((resolve, reject) => {
        const defaults = {
            folder: 'social-media-app/posts',
            resource_type: 'image',
        };

        const stream = cloudinary.uploader.upload_stream(
            { ...defaults, ...options },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });
}

export default cloudinary;
