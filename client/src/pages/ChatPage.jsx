import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
    getChatHistory,
    markMessagesAsRead 
} from '../redux/features/chat/chatThunks';
import { 
    resetMessages, 
    clearNotificationForSender,
    setActiveChat,
    clearActiveChat,
} from '../redux/features/chat/chatSlice';
import { getUserById } from '../redux/features/users/userThunks';
import { clearUserProfile } from '../redux/features/users/userSlice';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa'; // ⭐ Добавил иконку ошибки
import { FaEllipsisH } from 'react-icons/fa';

// ⭐ Импортируем типы действий для Socket.IO
import { JOIN_CHAT, LEAVE_CHAT } from '../redux/actions/actionTypes';

import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import ConfirmationModal from '../components/chat/ConfirmationModal';


function ChatPage() {
    const { receiverId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { 
        isLoading: isChatLoading, 
        isError: isChatError, 
        error: chatError, 
        isReceiverTyping 
    } = useSelector((state) => state.chat); 
    const { user } = useSelector((state) => state.auth);
    const { 
        isLoading: isProfileLoading, 
        isError: isProfileError, 
        error: profileError, 
        userProfile: receiverData 
    } = useSelector((state) => state.users); 

    // ⭐ СОСТОЯНИЕ ДЛЯ МОДАЛЬНОГО ОКНА
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const openConfirmModal = (title, message, onConfirm) => {
        setModalState({ isOpen: true, title, message, onConfirm });
    };

    const closeConfirmModal = () => {
        setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    };


    useEffect(() => {
        // Если пользователь не авторизован, перенаправляем на логин
        if (!user) {
            navigate('/login');
            return;
        }

        if (receiverId) {
            // ⭐ 1. Загружаем историю чата и данные профиля собеседника
            dispatch(resetMessages());
            dispatch(getChatHistory({ receiverId, currentUserId: user._id }));
            dispatch(getUserById(receiverId));

            // ⭐ 2. Устанавливаем активный чат в Redux
            dispatch(setActiveChat(receiverId));

            // ⭐ 3. Отправляем Socket.IO событие "joinChat"
            dispatch({ type: JOIN_CHAT, payload: { receiverId } });

            // ⭐ 4. Помечаем сообщения как прочитанные на бэкенде
            dispatch(markMessagesAsRead(receiverId));

            // ⭐ 5. Очищаем уведомления для этого собеседника на фронтенде
            dispatch(clearNotificationForSender(receiverId));
        } else {
            // Если receiverId отсутствует (например, /chat), то очищаем Redux
            dispatch(resetMessages());
            dispatch(clearUserProfile());
            dispatch(clearActiveChat());

            // Отправляем событие Socket.IO о выходе из чата
            dispatch({ type: LEAVE_CHAT });
        }
        
        // ⭐ Функция очистки (cleanup) при размонтировании компонента или смене receiverId
        return () => {
            dispatch(clearUserProfile());
            
            // ⭐ Важно: при выходе с ChatPage или переключении на другой чат:
            dispatch(clearActiveChat());
            // Отправляем Socket.IO событие о выходе из чата
            dispatch({ type: LEAVE_CHAT });
        };
    }, [dispatch, receiverId, user, navigate]);


    if (!user) {
        // ⭐ Обновленная стилизация для экрана "Нет пользователя"
        return (
            <div className="flex justify-center items-center h-screen bg-neutral-950">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (isChatLoading || isProfileLoading) {
        // ⭐ Обновленная стилизация для экрана загрузки (загрузка данных в процессе)
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-70">
                <FaSpinner className="animate-spin text-5xl text-blue-400" />
                <p className="ml-4 text-gray-400">Вход в чат...</p>
            </div>
        );
    }

    if (isChatError || isProfileError) {
        // ⭐ Обновленная стилизация для экрана ошибки
        const errorMessage = (chatError?.message || profileError?.message || 'Произошла ошибка при загрузке чата или профиля.');
        return (
            <div className="flex justify-center items-center h-screen bg-neutral-950">
                <div className="text-center p-8 bg-neutral-800 rounded-xl shadow-2xl">
                    <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl text-red-400 mb-2">Ошибка загрузки</h2>
                    <p className="text-gray-300 max-w-sm">{errorMessage}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        Повторить
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-[88vh] bg-neutral-950"> 
            <div className="flex flex-col flex-grow mx-auto w-full 
            max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 
            bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 
            "> 
                
                <ChatHeader 
                    openConfirmModal={openConfirmModal} 
                    closeConfirmModal={closeConfirmModal}
                    receiverData={receiverData}
                    currentUserId={user._id}
                    navigate={navigate}
                />
                
                {/* MessageList должен иметь внутренний скролл (flex-1 overflow-y-auto) */}
                <MessageList 
                    openConfirmModal={openConfirmModal} 
                    closeConfirmModal={closeConfirmModal}
                    receiverData={receiverData}
                    currentUserId={user._id}
                />
                
                <MessageInput 
                    receiverId={receiverId} 
                    receiverData={receiverData} 
                    currentUserId={user._id}
                />

                {isReceiverTyping && (
                    // ⭐ Улучшенный вид "печатает..."
                    <div className="absolute bottom-20 left-4 flex items-center space-x-2 p-2 rounded-full bg-neutral-700 text-gray-300 w-fit z-10 transition duration-300 ease-out">
                        <span className="animate-pulse text-blue-400">
                            <FaEllipsisH className="text-lg" />
                        </span>
                        <span className="text-sm font-medium">{receiverData?.username} печатает...</span>
                    </div>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={closeConfirmModal}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.title === 'Выбрать сообщения' ? 'Выберите сообщения для удаления.' : modalState.message}
            />
        </div>
    );
}

export default ChatPage;