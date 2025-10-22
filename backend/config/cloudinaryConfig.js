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
// Используем memoryStorage, чтобы multer временно хранил файл в памяти (req.files[i].buffer)
const storage = multer.memoryStorage(); 

// 🌟 ИСПРАВЛЕНИЕ 1: Фильтр для проверки типа файла (Изображения И Видео)
const fileFilter = (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
        cb(null, true);
    } else {
        // Передача ошибки, которая будет поймана Multer'ом и обработана
        cb(new Error('Неподдерживаемый тип файла. Разрешены только изображения и видео.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        // Увеличим лимит для видео (например, до 50MB), если это необходимо
        fileSize: 1024 * 1024 * 50 // Ограничение размера файла: 50MB (пример)
    }
});

export { cloudinary, upload };