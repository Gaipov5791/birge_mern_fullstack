import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: [true, "Пожалуйста, добавьте текст поста"],
        trim: true,
        maxlength: [500, "Пост не должен превышать 500 символов"],
    },
    hashtags: {
        type: [String], // Массив строк
        default: [],    // По умолчанию - пустой массив
        lowercase: true, // Полезно для единообразия поиска и агрегации
        trim: true,
    },
    media: [
        {
            type: { type: String, enum: ['image', 'video'], required: true }, // Тип файла
            url: { type: String, required: true }, // Путь к файлу
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    commentsCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Post = mongoose.model("Post", postSchema);
export default Post;