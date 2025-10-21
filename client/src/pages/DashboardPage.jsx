import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getPosts, deletePost } from '../redux/features/posts/postThunks'; // ⭐ Добавили импорты thunk-ов

import { logoutUser as logoutUserThunk } from '../redux/features/auth/authThunks'; // ⭐ Импортируем thunk для выхода
import { reset as resetAuth } from '../redux/features/auth/authSlice'; // ⭐ Импортируем редьюсер для сброса auth состояния
import Sidebar from '../components/common/Sidebar';
import RightSidebar from '../components/common/RightSidebar';

import { 
    reset,
    // ⭐ Импортируем редьюсеры для управления модальными окнами
    clearPostIdToDelete,
    clearPostIdToEdit,
    clearNewlyCreatedPostId,
} from '../redux/features/posts/postSlice'; 

import PostForm from '../components/PostForm';
import PostItem from '../components/PostItem';
import LoadingModal from '../components/common/LoadingModal'; 
import ConfirmationModal from '../components/chat/ConfirmationModal'; // Предполагаем, что он в common
// ⭐ НОВЫЙ ИМПОРТ: Предполагаем, что у вас есть компонент для редактирования поста
import PostEditModal from '../components/common/PostEditModal'; 
import PostSkeleton from '../components/posts/PostSkeleton';

import { FaSpinner, FaCloudShowersHeavy } from 'react-icons/fa';
import { toastSuccess, toastError } from '../redux/features/notifications/notificationSlice';

function DashboardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { 
        timelinePosts, 
        isLoading, 
        isError, 
        message, 
        postsLoaded,
        isPostOperationLoading,
        // ⭐ ИЗМЕНЕНИЯ: Извлекаем новые состояния для модальных окон
        postIdToDelete,
        postIdToEdit,
        newlyCreatedPostId,
    } = useSelector(
        (state) => state.posts
    );

    const postRefs = useRef({});

    // ⭐ ЛОКАЛЬНЫЙ onLogout для передачи в Sidebar (Позже можно вынести выше)
    const onLogout = useCallback(() => {
        dispatch(logoutUserThunk());
        dispatch(resetAuth());
        navigate("/login");
    }, [dispatch, navigate]);

    // ⭐ СКРОЛЛ: Прокручиваем к новому посту, если он был только что создан
    useEffect(() => {
        if (newlyCreatedPostId && postRefs.current[newlyCreatedPostId]) {
            postRefs.current[newlyCreatedPostId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Очищаем ID после прокрутки, чтобы не прокручивало снова
            dispatch(clearNewlyCreatedPostId());
        }
    }, [newlyCreatedPostId, dispatch]);

    // ⭐ ЛОГ: Отслеживаем изменение флага загрузки операций
    useEffect(() => {

    }, [isPostOperationLoading]);

    // ⭐ ИЗМЕНЕНИЯ: Определяем, какой пост редактируется/удаляется
    const postToEdit = timelinePosts.find(p => p._id === postIdToEdit);
    // Определяем сообщение для LoadingModal (если оно было установлено в pending-редюсере)
    const loadingMessage = isPostOperationLoading ? message : "Загрузка...";


    // ⭐ 1. useEffect для загрузки постов 
    useEffect(() => {
        if (user && !postsLoaded) {
            dispatch(getPosts());
        }

        return () => {
            dispatch(reset()); 
        };
    }, [dispatch, user, postsLoaded]);

    // ⭐ 2. useEffect для обработки ошибок
    useEffect(() => {
        if (isError) {
            dispatch(toastError(message));
            // Если ошибка произошла в модалке, закрываем ее.
            dispatch(clearPostIdToDelete());
            dispatch(clearPostIdToEdit());
        }
    }, [isError, message, dispatch]);

    
    // --- ХЕНДЛЕРЫ ДЛЯ МОДАЛЬНЫХ ОКОН ---

    // ⭐ Хендлер для закрытия обоих модальных окон (редактирования и удаления)
    const handleCloseModals = () => {
        dispatch(clearPostIdToDelete());
        dispatch(clearPostIdToEdit());
    };

    // ⭐ Хендлер для подтверждения удаления
    const handleDeleteConfirm = () => {
        if (postIdToDelete) {

            handleCloseModals();

            dispatch(deletePost(postIdToDelete)) // Вызываем thunk
                .unwrap()
                .then(() => {
                    dispatch(toastSuccess('Пост успешно удален!'));
                     
                })
                .catch((error) => {
                    // Ошибка будет обработана в общем useEffect, но можем добавить тут
                    dispatch(toastError(`Ошибка удаления: ${error}`));
                    handleCloseModals();
                });
        }
    };
    
    //⭐ 1. Обработка состояния загрузки на весь экран
    if (isLoading) {
        return (
            <PostSkeleton />
        );
    }
    
    // ⭐ 2. Вывод сообщения об ошибке
    if (isError && !isPostOperationLoading) { // Убедимся, что не показываем ошибку, пока идёт операция
        return (
            <div className='min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8'>
                <FaCloudShowersHeavy className='text-6xl text-red-500 mb-4' />
                <h1 className='text-2xl text-gray-100 bg-neutral-800 p-6 rounded-xl shadow-xl border border-red-500'>
                    Ошибка загрузки: <span className="font-light text-red-400">{message || 'Не удалось загрузить ленту.'}</span>
                </h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto flex">

                {/* 1. ЛЕВАЯ КОЛОНКА: Sidebar */}
                {/* w-72: Фиксированная ширина для Sidebar.
                    hidden lg:block: Скрываем на мобильных, показываем на больших экранах.
                */}
                <div className="hidden lg:block w-72 flex-shrink-0">
                    <Sidebar onLogout={onLogout} />
                </div>

                {/* 2. ЦЕНТРАЛЬНАЯ КОЛОНКА: Лента Постов */}
                <main className="flex-grow min-w-0 overflow-hidden mx-auto lg:mx-8"> 
                    
                    <h1 className='mt-5 text-xl sm:text-3xl font-extrabold text-center mb-10 text-gray-100 uppercase tracking-wider'>
                        Ваша <span className="text-blue-400">Лента</span> Новостей
                    </h1>

                    {user && <PostForm />}
                    
                    {timelinePosts && timelinePosts.length > 0 ? (
                        <div className='posts-container mt-8 space-y-6'>
                            {/* ... (рендеринг PostItem - БЕЗ ИЗМЕНЕНИЙ) ... */}
                            {timelinePosts.map((post) => (
                                <div 
                                    key={post._id}
                                    ref={el => postRefs.current[post._id] = el}
                                >
                                    <PostItem post={post} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        user && !isLoading && (
                            <h3 className='text-center text-xl text-gray-500 p-10 border border-neutral-800 bg-neutral-800 rounded-xl mt-8 shadow-inner shadow-neutral-900/50'>
                                Нет постов в вашей ленте. Подпишитесь на других пользователей или создайте свой первый пост!
                            </h3>
                        )
                    )}

                </main>

                {/* 3. ПРАВАЯ КОЛОНКА: Для будущих виджетов (сейчас просто пустое место) */}
                {/* w-72: Та же ширина, что и у левой панели, для симметрии
                    hidden lg:block: Скрываем на мобильных, показываем на больших экранах.
                */}
                <div className="hidden lg:block w-72 flex-shrink-0">
                    <RightSidebar />
                </div>
            </div>
            
            {/* -------------------- МОДАЛЬНЫЕ ОКНА ДЛЯ ПОСТОВ -------------------- */}

            {/* 1. Модальное окно загрузки для операций обновления/удаления */}
            <LoadingModal 
                isOpen={isPostOperationLoading} 
                message={loadingMessage}
            />

            {/* 2. Модальное окно подтверждения удаления */}
            <ConfirmationModal
                // ⭐ Активируем, если в Redux есть ID поста для удаления
                isOpen={!!postIdToDelete}
                onClose={handleCloseModals} // Используем общий хендлер для закрытия
                onConfirm={handleDeleteConfirm} // Хендлер для выполнения Thunk
                title="Подтвердите удаление поста"
                // Сообщение теперь о посте, а не о комментарии
                message="Вы уверены, что хотите безвозвратно удалить этот пост? Это действие нельзя отменить."
            />

            {/* 3. Модальное окно редактирования поста */}
            {/* Активируем, если в Redux есть ID поста для редактирования */}
            <PostEditModal
                isOpen={!!postIdToEdit}
                onClose={handleCloseModals}
                post={postToEdit} // Передаем найденный объект поста
            />
            
        </div>
    );
}

export default DashboardPage;