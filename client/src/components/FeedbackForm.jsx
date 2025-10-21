// src/components/FeedbackForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { toastSuccess, toastError } from '../redux/features/notifications/notificationSlice'; 

const API_URL = import.meta.env.VITE_API_URL;

function FeedbackForm() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth); // Получаем данные текущего пользователя
    const [formData, setFormData] = useState({ subject: '', message: '' });
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const feedbackData = {
            ...formData,
            // Добавляем email пользователя для идентификации, если он авторизован
            userEmail: user ? user.email : 'Анонимный пользователь' 
        };

        try {
            await axios.post(API_URL + 'feedback', feedbackData);
            dispatch(toastSuccess('Спасибо за ваш отзыв!'));
            setFormData({ subject: '', message: '' }); // Очищаем форму
        } catch (error) {
            dispatch(toastError('Не удалось отправить отзыв. Попробуйте позже.'));
        } finally {
            setLoading(false);
        }
    };

    // Определяем, можно ли отправить форму
    const isFormValid = formData.subject.trim() !== '' && formData.message.trim() !== '';

    return (
        <form onSubmit={onSubmit} className="bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-100">Обратная связь</h2>
            <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={onChange}
                placeholder="Тема (например, 'Баг в ленте' или 'Предложение')"
                required
                className="w-full p-3 mb-4 bg-neutral-700 border border-neutral-600 rounded text-gray-100 placeholder-gray-400"
            />
            <textarea
                name="message"
                value={formData.message}
                onChange={onChange}
                placeholder="Ваше сообщение, замечание или предложение..."
                required
                rows="5"
                className="w-full p-3 mb-4 bg-neutral-700 border border-neutral-600 rounded text-gray-100 placeholder-gray-400 resize-none"
            ></textarea>
            <button
                type="submit"
                disabled={
                    loading || 
                    !formData.subject || 
                    !formData.message || 
                    !isFormValid
                }
                className="w-full p-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:bg-neutral-600 transition"
            >
                {loading ? 'Отправка...' : 'Отправить отзыв'}
            </button>
        </form>
    );
}

export default FeedbackForm;