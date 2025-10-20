import axios from 'axios';
const API_URL = 'http://localhost:5000/api/users/';

// Функция для получения токена из localStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? token : null
};


// Регистрация пользователя
const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);
  if (response.data.token) {
    // Сохраняем токен в localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Логин пользователя
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  if (response.data.token) {
    // Сохраняем токен в localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Выход пользователя
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Функция для подписки на пользователя
const followUser = async (userIdToFollow) => {
    console.log("authService.followUser: Делаю PUT запрос на", `/api/users/follow/${userIdToFollow}`);
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Добавляем токен в заголовки запроса
        },
    };
    const response = await axios.put(`${API_URL}follow/${userIdToFollow}`, {}, config);
    return response.data;
};

// Функция для отписки от пользователя
const unfollowUser = async (userIdToUnfollow) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Добавляем токен в заголовки запроса
        },
    };
    console.log("authService.unfollowUser: Делаю PUT запрос на", `/api/users/unfollow/${userIdToUnfollow}`);
    const response = await axios.put(`${API_URL}unfollow/${userIdToUnfollow}`, {}, config); 
    return response.data;
};

// Получение данных пользователя по токену
const getUserMe = async () => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Добавляем токен в заголовки запроса
        },
    };
    const response = await axios.get(`${API_URL}me`, config);
    return response.data;
};

export const authService = {
  register,
  login,
  logout,
  followUser,
  unfollowUser,
  getUserMe
};

export default authService;