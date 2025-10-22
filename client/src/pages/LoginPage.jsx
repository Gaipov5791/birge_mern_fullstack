import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../redux/features/auth/authThunks';
import { reset } from '../redux/features/auth/authSlice';
import { FaSignInAlt } from 'react-icons/fa';
import { toastError, toastSuccess } from '../redux/features/notifications/notificationSlice';

import GoogleAuthButton from '../components/auth/GoogleAuthButton';

function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { 
        user, 
        isLoading, 
        isError, 
        isSuccess, 
        message,
        isLoginLoading 
    } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {

        if (isError && message) {
            dispatch(toastError(message || 'Произошла ошибка при входе.'));
            dispatch(reset());
        }

        if (isSuccess || user) {
            setTimeout(() => {
                navigate('/dashboard');
            }, 500); // Небольшая задержка для лучшего UX
        }

        // Cleanup function для сброса состояния при размонтировании
        return () => {
             // Сбрасываем только, если компонент размонтируется до успешного входа
             if (!isSuccess && !user) {
                dispatch(reset());
            }
        };

    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        if (isLoading) return; // Предотвращаем множественные сабмиты

        if (!email || !password) {
            dispatch(toastError('Пожалуйста, заполните все поля.'));
            return;
        }

        const userData = {
            email,
            password,
        };

        dispatch(loginUser(userData));
        console.log('Login attempt with:', userData);
    };

    return (
        // ⭐ Тёмный фон
        <div className="flex items-center justify-center min-h-screen bg-neutral-950 p-4 sm:p-6 lg:p-8">
            {/* ⭐ Карточка формы */}
            <div className="w-full max-w-sm sm:max-w-md space-y-8 p-6 sm:p-10 bg-neutral-800 rounded-xl shadow-2xl shadow-blue-900/50">
                <div className="text-center">
                    {/* ⭐ Иконка */}
                    <FaSignInAlt className="mx-auto h-12 w-auto text-blue-400" />
                    <h2 className="mt-6 text-xl sm:text-3xl font-extrabold text-gray-100">
                        Войдите в свой аккаунт
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Добро пожаловать обратно в Бирге
                    </p>
                </div>
                
                {/* 1. ФОРМА ВХОДА (Email/Password) */}
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="relative block w-full px-4 py-3 border border-neutral-600 bg-neutral-700 placeholder-gray-400 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200"
                            placeholder="Электронная почта"
                            value={email}
                            onChange={onChange}
                        />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="relative block w-full px-4 py-3 border border-neutral-600 bg-neutral-700 placeholder-gray-400 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200"
                            placeholder="Пароль"
                            value={password}
                            onChange={onChange}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white uppercase bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-neutral-800 transition duration-200 shadow-md shadow-blue-500/30"
                            disabled={isLoginLoading}
                        >
                            {isLoginLoading ? 'Вход...' : 'Войти'}
                        </button>
                    </div>
                </form>

                {/* ⭐ 2. РАЗДЕЛИТЕЛЬ ИЛИ */}
                <div className="mt-6 text-center text-gray-500 relative">
                    <hr className="border-t border-neutral-700 absolute inset-y-1/2 w-full -z-10" />
                    <span className="bg-neutral-800 px-3 z-10 text-sm">ИЛИ</span>
                </div>

                {/* ⭐ 3. КНОПКА GOOGLE AUTH */}
                <div className="mt-6">
                    <GoogleAuthButton />
                </div>
                
                <p className="mt-4 text-center text-sm text-gray-400">
                    Еще нет аккаунта?{' '}
                    <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition duration-200">
                        Зарегистрируйтесь
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;