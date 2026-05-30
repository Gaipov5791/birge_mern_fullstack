import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/notifications`;

export const getUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return 0;
    }

    const response = await axios.get(`${API_URL}/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.count;
};

export const getNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return [];
    }

    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.notifications;
};

export const markNotificationsAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    const response = await axios.put(`${API_URL}/mark-as-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

const notificationService = {
    getUnreadCount,
    getNotifications,
    markNotificationsAsRead,
};

export default notificationService;
