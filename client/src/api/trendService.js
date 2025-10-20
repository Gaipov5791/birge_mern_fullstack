import axios from 'axios';

const API_URL = '/api/trends/';

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