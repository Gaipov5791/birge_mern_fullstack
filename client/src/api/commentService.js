import axios from "axios";
const API_URL = "http://localhost:5000/api/comments";

// Получаем токен из localStorage
const getToken = () => {
    return localStorage.getItem("token");
};

// Добавить комментарий к посту
const addComment = async (postId, commentData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Добавляем токен в заголовки запроса
        },
    };
    const response = await axios.post(`${API_URL}/${postId}`, commentData, config); 
    return response.data;
};

// Получить комментарии к посту
const getCommentsForPost = async (postId) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Добавляем токен в заголовки запроса
        },
    };
    const response = await axios.get(`${API_URL}/${postId}`, config);
    return response.data;
};

// Удалить комментарий
const deleteComment = async (commentId) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Добавляем токен в заголовки запроса
        },
    };
    const response = await axios.delete(`${API_URL}/${commentId}`, config);
    return response.data;
};

// Обновить комментарий
const updateComment = async (commentId, commentData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Добавляем токен в заголовки запроса
        },
    };
    const response = await axios.put(`${API_URL}/${commentId}`, commentData, config);
    return response.data;
};

export const commentService = {
    addComment,
    getCommentsForPost,
    deleteComment,
    updateComment,
};

export default commentService;