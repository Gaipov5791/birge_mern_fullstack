// backend/server.js
import express from 'express';
import session from 'express-session';
import passport from './config/passport.js';
import connectMongo from 'connect-mongodb-session';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import connectDB from '../backend/config/db.js';
import userRoutes from '../backend/routes/userRoutes.js';
import postRoutes from '../backend/routes/postRoutes.js';
import commentRoutes from '../backend/routes/commentRoutes.js';
import trendRoutes from '../backend/routes/trendRoutes.js';
import feedbackRoutes from '../backend/routes/feedbackRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

connectDB();

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());

const MongoDBStore = connectMongo(session);

const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions',
});

store.on('error', (error) => {
    console.error('Ошибка Mongo Session Store:', error);
});

const PORT = process.env.PORT || 5000;

app.use(session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
    },
}));

app.use(passport.initialize());
app.use(passport.session());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
    res.send('Сервер готов к работе!');
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Файл слишком большой (максимум 10 МБ)' });
        }
    }
    next(err);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
