import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config(); // Загружаем переменные окружения

// Настройка Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const TEN_MB = 10 * 1024 * 1024;

const IMAGE_UPLOAD_TRANSFORMATION = [
    { width: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
];

// Настройка Multer для обработки файлов
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый тип файла. Разрешены только изображения и видео.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: TEN_MB,
    },
});

export { cloudinary, upload, IMAGE_UPLOAD_TRANSFORMATION, TEN_MB };

export default cloudinary;