import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        readBy: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ],
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true, // Сообщение всегда должно принадлежать какому-то диалогу
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        delivered: {
            type: Boolean,
            default: false,
        },
        deletedBy: { 
            type: [mongoose.Schema.Types.ObjectId], 
            ref: "User",
            default: []
        },
    },
    { timestamps: true
    }
);

const Chat = mongoose.model("Message", chatSchema);

export default Chat;