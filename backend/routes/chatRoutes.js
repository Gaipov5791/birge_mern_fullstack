import express from "express";
import { protect } from "../middleware/authMddleware.js";
import { 
    getChatHistory, 
    sendMessage, 
    markMessageAsRead, 
    clearChat,
    deleteMessageForEveryone,
    deleteAllMessagesForEveryone, 
} from "../controllers/chatController.js";

const router = express.Router();

// Маршрут для получения истории сообщений между двумя пользователями
// GET /api/chat/messages/:receiverId
router.get("/messages/:receiverId", protect, getChatHistory);

// Маршрут для отправки сообщения
// POST /api/chat/messages
router.post("/messages", protect, sendMessage);

// Маршрут для пометки сообщения как прочитанного
// PUT /api/chat/messages/read/:senderId
router.put("/messages/read/:senderId", protect, markMessageAsRead);

// Маршрут для очистки чата между двумя пользователями
// DELETE /api/chat/clear/:receiverId
router.put("/clear/:receiverId", protect, clearChat);

// Маршрут для удаления одного сообщения для всех
// DELETE /api/chat/message/:messageId
router.delete("/message/:messageId", protect, deleteMessageForEveryone);

// Маршрут для удаления всех сообщений для всех
// DELETE /api/chat/messages/all
router.delete("/messages/all", protect, deleteAllMessagesForEveryone);


export default router;