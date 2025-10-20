import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],
    // ⭐ Счетчик непрочитанных сообщений для каждого участника в этом диалоге
    unreadCounts: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        count: { type: Number, default: 0 }
    }],
    lastMessage: { // Ссылка на последнее сообщение в этом диалоге
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Message" 
    },
    lastMessageAt: { // Время последнего сообщения (для сортировки в Центре уведомлений)
        type: Date, 
        default: Date.now 
    },
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;