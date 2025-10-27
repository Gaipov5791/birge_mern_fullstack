import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// URL для чата: [Render URL]/api/chat/
const API_URL = `${BASE_URL}/chat/`; 
// URL для уведомлений: [Render URL]/api/notifications
const NOTIFICATION_API_URL = `${BASE_URL}/notifications`;

// Получение истории сообщений
const getChatHistory = async (receiverId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}messages/${receiverId}`, config);
    return response.data;
};

// Отправка сообщения
const sendMessage = async (messageData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL + 'messages', messageData, config);
    return response.data;
};

// Функция для пометки сообщений как прочитанных
const markMessagesAsRead = async (receiverId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}messages/read/${receiverId}`, {}, config);
    return response.data;
};  

// Функция для очистки чата с конкретным пользователем
const clearChat = async (receiverId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}clear/${receiverId}`, {}, config);
    return response.data;
}

// Функция для удаления одного сообщения для всех 
const deleteMessageForEveryone = async (messageId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Нет токена авторизации');
    }
    
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}message/${messageId}`, config);
    return response.data;
}

// Функция для удаления всех сообщений для всех
const deleteAllMessagesForEveryone = async (messageIds, receiverId) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Нет токена авторизации');
    }

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // Отправляем массив ID сообщений в теле DELETE-запроса
    // и ID собеседника для бэкенда.
    const response = await axios.delete(
        `${API_URL}messages/all`, 
        { 
            data: { messageIds, receiverId }, 
            ...config 
        }
    );
    return response.data;
}; 

// Получение сводки непрочитанных сообщений
const fetchUnreadConversationsSummary = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${NOTIFICATION_API_URL}/unread-summary`, config);
    return response.data; // Ожидается, что сервер вернет массив объектов с информацией о непрочитанных сообщениях
};


// Активация чата (для гарантии коммуникации с сервером)
const activateChatConnection = async (receiverId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // Отправляем PUT запрос на новый легкий эндпоинт. 
    // На сервере этот эндпоинт просто возвращает 200 OK.
    const response = await axios.put(`${API_URL}activate/${receiverId}`, {}, config);
    return response.data;
};


const chatService = {
    getChatHistory,
    sendMessage,
    markMessagesAsRead,
    clearChat,
    deleteMessageForEveryone,
    deleteAllMessagesForEveryone,
    fetchUnreadConversationsSummary,
    activateChatConnection,
};

export default chatService;