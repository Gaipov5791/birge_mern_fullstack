import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { 
    clearChat as clearChatAction, 
    deleteAllMessagesForEveryone 
} from '../../redux/features/chat/chatThunks';
import LoadingModal from '../common/LoadingModal';
import PropTypes from 'prop-types';


const ChatHeader = ({openConfirmModal, closeConfirmModal}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { receiverId } = useParams();
    const { messages } = useSelector((state) => state.chat);
    const { userProfile: receiverData } = useSelector((state) => state.users);
    const { onlineUsers } = useSelector((state) => state.chat); 
    
    const isReceiverOnline = onlineUsers.includes(receiverId);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // ⭐ НОВОЕ СОСТОЯНИЕ: для модального окна загрузки в шапке
    const [isHeaderLoading, setIsHeaderLoading] = useState(false);
    // ⭐ НОВОЕ СОСТОЯНИЕ: для сообщения в модальном окне загрузки
    const [loadingMessage, setLoadingMessage] = useState("Загрузка...");
    
    const menuRef = useRef(null);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleClearChat = () => {
        setIsMenuOpen(false);
        openConfirmModal(
            'Очистить чат',
            'Вы уверены, что хотите очистить этот чат? Это удалит все сообщения только для вас.',
            async () => { 
                closeConfirmModal(); 
                setLoadingMessage("Очистка чата..."); 
                setIsHeaderLoading(true); 
                try {
                    await dispatch(clearChatAction(receiverId)).unwrap();
                    console.log('Чат успешно очищен только для вас.');
                } catch (error) {
                    console.error('Ошибка при очистке чата:', error);
                    // Здесь можно показать сообщение об ошибке
                } finally {
                    setIsHeaderLoading(false); 
                }
            }
        );
    };

    const handleDeleteAllMessages = () => {
        setIsMenuOpen(false);
        openConfirmModal(
            'Удалить все сообщения',
            'Вы уверены, что хотите удалить все сообщения в этом чате для всех? Это действие необратимо!', // ⭐ Усилено предупреждение
            async () => { 
                closeConfirmModal(); 
                setLoadingMessage("Удаление всех сообщений..."); 
                setIsHeaderLoading(true); 
                try {
                    const messageIds = messages.map(msg => msg._id);
                    await dispatch(deleteAllMessagesForEveryone({ messageIds, receiverId })).unwrap();
                    console.log('Все сообщения успешно удалены для всех.');
                } catch (error) {
                    console.error('Ошибка при удалении всех сообщений:', error);
                    // Здесь можно показать сообщение об ошибке
                } finally {
                    setIsHeaderLoading(false); 
                }
            }
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        // ⭐ Обновленная стилизация: bg-neutral-800, border-b для чистого разделения.
        <header className="bg-neutral-800 p-3 w-full flex items-center justify-between sticky top-0 z-20 border-b border-neutral-700">
            <div className="flex items-center">
                <button
                    onClick={handleGoBack}
                    className="p-1 rounded-full text-blue-400 hover:bg-neutral-700 transition duration-200 focus:outline-none mr-3 sm:mr-4"
                    aria-label="Назад к списку чатов"
                >
                    <AiOutlineArrowLeft className="text-xl md:text-2xl" />
                </button>
                {receiverData && (
                    <div className="flex items-center cursor-pointer" onClick={() => navigate(`/profile/${receiverId}`)}> {/* ⭐ Добавил переход в профиль по клику */}
                        <div className="relative mr-3">
                            <img
                                src={receiverData.profilePicture || '/default-avatar.jpg'} // ⭐ Добавил fallback
                                alt="Аватар"
                                // ⭐ Увеличенный аватар
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                            />
                            {isReceiverOnline && (
                                // ⭐ Более заметный онлайн-индикатор
                                <span className="absolute bottom-0 right-0 block w-3 h-3 md:w-3.5 md:h-3.5 bg-green-400 rounded-full border-2 border-neutral-800" />
                            )}
                        </div>
                        <div>
                            {/* ⭐ Контрастный заголовок */}
                            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{receiverData.username}</h2>
                            {/* ⭐ Акцентный цвет для статуса */}
                            <p className={`text-xs md:text-sm ${isReceiverOnline ? 'text-green-400' : 'text-gray-400'}`}>
                                {isReceiverOnline ? 'В сети' : 'Не в сети'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    // ⭐ Стильная кнопка с точками
                    className="p-2 rounded-full text-white hover:bg-neutral-700 transition duration-200 focus:outline-none"
                    aria-label="Меню опций чата"
                >
                    <HiOutlineDotsVertical className="text-xl md:text-2xl" />
                </button>
                {isMenuOpen && (
                    // ⭐ Стильное выпадающее меню
                    <div className="absolute right-0 mt-2 w-52 bg-neutral-700 border border-neutral-600 rounded-lg shadow-xl overflow-hidden z-30 transform origin-top-right animate-fade-in-down">
                        <button
                            onClick={handleClearChat}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-neutral-600 transition duration-150"
                        >
                            Очистить чат (только у себя)
                        </button>
                        <button
                            onClick={handleDeleteAllMessages}
                            // ⭐ Привлекаем внимание к необратимому действию
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-600 transition duration-150"
                        >
                            Удалить все сообщения (для всех)
                        </button>
                    </div>
                )}
            </div>
            {/* ⭐ Рендерим наше новое модальное окно загрузки */}
            <LoadingModal isOpen={isHeaderLoading} message={loadingMessage} />
        </header>
    );
};
// ⭐ ОБНОВЛЯЕМ PROP-TYPES
ChatHeader.propTypes = {
    openConfirmModal: PropTypes.func.isRequired,
    closeConfirmModal: PropTypes.func.isRequired,
    // Добавляю пропсы, которые ты, вероятно, передаешь из ChatPage.jsx (если они нужны в ChatHeader, хотя в твоем коде они не использовались)
    receiverData: PropTypes.object,
    currentUserId: PropTypes.string,
    navigate: PropTypes.func,
};

export default ChatHeader;