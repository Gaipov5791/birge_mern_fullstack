import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/notifications`;

const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getUnreadCount = async () => {
    const response = await axios.get(`${API_URL}/unread-count`, getAuthConfig());
    return response.data.count;
};

export const getNotifications = async () => {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data.notifications;
};

export const markNotificationsAsRead = async () => {
    const response = await axios.put(`${API_URL}/mark-as-read`, {}, getAuthConfig());
    return response.data;
};

const notificationService = {
    getUnreadCount,
    getNotifications,
    markNotificationsAsRead,
};

export default notificationService;
