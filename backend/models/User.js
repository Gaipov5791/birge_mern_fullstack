import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Пожалуйста, добавьте имя пользователя"],
        unique: true,
        trim: true,
        minlength: [3, "Имя пользователя должно содержать не менее 3 символов"],
    },
    email: {
        type: String,
        required: [true, "Пожалуйста, добавьте адрес электронной почты"],
        unique: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Пожалуйста, введите действительный адрес электронной почты",
        ],
    },
    password: {
        type: String,
        required: false, // Необязательно для пользователей Google OAuth
        minlength: [6, "Пароль должен содержать не менее 6 символов"],
    },
    profilePicture: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    bio: {
        type: String,
        default: "Напишите что-нибудь о себе",
        maxlength: [200, "Биография не должна превышать 200 символов"],
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    googleId: {
        type: String,
        required: false, // Необязательно для обычных пользователей
        unique: true,
        sparse: true // Позволяет нескольким документам иметь null, но только одному иметь конкретное значение.
    },
}, 
{
    timestamps: true,
}
);

export const User = mongoose.model("User", userSchema);
export default User;