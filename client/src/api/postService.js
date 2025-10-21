import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_URL = `${BASE_URL}/posts`;

// Получаем токен из localStorage
const getToken = () => {
    return localStorage.getItem("token");
};

// Создать новый пост
const createPost = async (postData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(`${API_URL}/create`, postData, config);
    return response.data;
};

// Получить все посты
const getPosts = async () => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Получить посты конкретного пользователя
const getUserPosts = async (userId) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/user/${userId}`, config);
    return response.data;
};

// Поставить/убрать лайк посту
const likePost = async (postId) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/like/${postId}`, {}, config);
    return response.data;
};

// Обновление поста
const updatePost = async (postId, postData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/${postId}`, postData, config);
    return response.data;
};

// Удаление поста
const deletePost = async (postId) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/${postId}`, config);
    return response.data;
};

// Получение поста по ID
const getPostById = async (postId) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/${postId}`, config);
    return response.data;
};

// Получение постов по хэштегу
const getPostsByHashtag = async (tagName) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/hashtag/${tagName}`, config);
    return response.data.posts;
};

// Получаем посты для ленты новостей (timeline)
const getTimelinePosts = async () => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/timeline`, config);
    return response.data;
};

// Экспортируем функции для использования в других частях приложения
export const postService = {
    createPost,
    getPosts,
    getUserPosts,
    likePost,
    updatePost,
    deletePost,
    getPostById,
    getPostsByHashtag,
    getTimelinePosts,
};

export default postService;
