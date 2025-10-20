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

// Настройка Multer для обработки файлов
// Используем memoryStorage, чтобы multer временно хранил файл в памяти,
// прежде чем мы отправим его в Cloudinary.
const storage = multer.memoryStorage(); 

// Фильтр для проверки типа файла (только изображения)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только файлы изображений!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Ограничение размера файла: 5MB
    }
});

export { cloudinary, upload };