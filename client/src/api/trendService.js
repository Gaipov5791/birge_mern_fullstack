import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_URL = `${BASE_URL}/trends`;

// Функция для получения списка трендов
const getTrends = async (token) => {
    const config = {};
    if (token) {
        config.headers = {  
            Authorization: `Bearer ${token}`,
        };
    }
    const response = await axios.get(API_URL, config);
    return response.data;   
};

const trendService = {
    getTrends,
};
export default trendService;