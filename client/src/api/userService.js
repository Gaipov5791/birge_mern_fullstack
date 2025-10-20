import axios from "axios";
const API_URL = 'http://localhost:5000/api/users/';

// Функция для получения токена из локального хранилища (если нужно)
const getToken = () => {
    return localStorage.getItem('token');
};


// Функция для получения профиля пользователя по ID
const getUserById = async (userId) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Добавляем токен в заголовки запроса
        },
    };
    const response = await axios.get(`${API_URL}${userId}`, config);
    return response.data;
};

// Функция для получения рекомендованных пользователей
const getRecommendedUsers = async () => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Добавляем токен в заголовки запроса
        },
    };
    const response = await axios.get(`${API_URL}recommended`, config);
    return response.data;
};


// Экспортируем функции
const userService = {
    getUserById,
    getRecommendedUsers,
};

export default userService;

