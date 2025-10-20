import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../redux/features/auth/authThunks';
import { reset } from '../redux/features/auth/authSlice';
import { FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
    });

    const { username, email, password, password2 } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message || 'Произошла ошибка при регистрации.');
        }

        if (isSuccess || user) {
            // После успешной регистрации перенаправляем на страницу входа или дашборд
            navigate('/login'); 
            // Очистка состояния здесь (если нужно)
            dispatch(reset());
        }
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        if (password !== password2) {
            toast.error('Пароли не совпадают. Пожалуйста, попробуйте снова.');
        } else {
            const userData = {
                username,
                email,
                password,
            };
            dispatch(registerUser(userData));
        }
    };

    // Применяем тёмную тему
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-950 p-4 sm:p-6 lg:p-8">
            {/* ⭐ Карточка формы: Тёмный фон, синяя тень, скругленные углы */}
            <div className="w-full max-w-sm sm:max-w-md space-y-8 p-6 sm:p-10 bg-neutral-800 rounded-xl shadow-2xl shadow-blue-900/50">
                <div className="text-center">
                    {/* ⭐ Иконка: Акцентный синий цвет */}
                    <FaUserPlus className="mx-auto h-12 w-auto text-blue-400" />
                    <h2 className="mt-6 text-xl sm:text-3xl font-extrabold text-gray-100">
                        Создайте Аккаунт
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Присоединяйтесь к Бирге и начните делиться!
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        {/* ⭐ Поля ввода: Тёмный фон, светлый текст, синий фокус */}
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="relative block w-full px-4 py-3 border border-neutral-600 bg-neutral-700 placeholder-gray-400 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200"
                            placeholder="Имя пользователя"
                            value={username}
                            onChange={onChange}
                        />
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
                            autoComplete="new-password"
                            required
                            className="relative block w-full px-4 py-3 border border-neutral-600 bg-neutral-700 placeholder-gray-400 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200"
                            placeholder="Пароль"
                            value={password}
                            onChange={onChange}
                        />
                        <input
                            id="password2"
                            name="password2"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="relative block w-full px-4 py-3 border border-neutral-600 bg-neutral-700 placeholder-gray-400 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200"
                            placeholder="Подтвердите пароль"
                            value={password2}
                            onChange={onChange}
                        />
                    </div>

                    <div>
                        {/* ⭐ Кнопка: Акцентный синий цвет с тенью */}
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white uppercase bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-neutral-800 transition duration-200 shadow-md shadow-blue-500/30"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                    </div>
                </form>
                
                <p className="mt-4 text-center text-sm text-gray-400">
                    Уже есть аккаунт?{' '}
                    {/* ⭐ Ссылка: Акцентный синий цвет */}
                    <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition duration-200">
                        Войдите
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;