import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from 'react-icons/io5';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import PropTypes from 'prop-types';

import LoadingModal from '../common/LoadingModal';
import { deleteMessageForEveryone } from '../../redux/features/chat/chatThunks';

// Функция для парсинга текста на наличие ссылок
const parseMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (urlRegex.test(part)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    // ⭐ Обновленные стили для ссылок в темной теме
                    className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 underline font-medium" 
                >
                    {part}
                </a>
            );
        }
        return part;
    });
}

const MessageList = ({ openConfirmModal, closeConfirmModal, receiverData }) => {
    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();
    const { messages } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    
    const [isDeletingLoading, setIsDeletingLoading] = useState(false);
    // ⭐ Добавим состояние для меню опций сообщения
    const [messageMenuOpenId, setMessageMenuOpenId] = useState(null);
    const menuRef = useRef(null);

    // Закрытие меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMessageMenuOpenId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDeleteSingleMessage = (messageId) => {
        setMessageMenuOpenId(null); // Закрываем меню после выбора опции
        const messageToDelete = messages.find(msg => msg._id === messageId);
        if (!messageToDelete) {
            alert('Ошибка: Сообщение не найдено в вашем чате.');
            return;
        }
        openConfirmModal(
            'Удалить сообщение',
            'Вы уверены, что хотите удалить это сообщение для всех?',
            async () => {
                closeConfirmModal();
                setIsDeletingLoading(true);
                try {
                    await dispatch(deleteMessageForEveryone(messageId)).unwrap();
                } catch (error) {
                    console.error('Ошибка при удалении сообщения ID:', messageId, error);
                } finally {
                    setIsDeletingLoading(false);
                }
            }
        );
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Прокручиваем вниз при загрузке сообщений
    useEffect(scrollToBottom, [messages]);

    // ⭐ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Фильтрация null/undefined сообщений
    const validMessages = messages.filter(msg => msg != null);

    return (
        // ⭐ Новый стильный скроллбар и небольшой фон, если MessageList не заполнен
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-neutral-800 custom-scrollbar scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800">
            {validMessages.map((message, index) => {

                // Проверка на случай, если сообщение по какой-то причине не имеет _id
                if (!message._id) {
                    console.error("Сообщение без _id пропущено при рендеринге:", message);
                    return null; 
                }

                const senderId = message.sender && typeof message.sender === 'object' ? message.sender._id : message.sender;
                const isMyMessage = senderId === user._id;
                const senderData = isMyMessage ? user : receiverData;

                const currentMessageIndexInValid = validMessages.findIndex(m => m._id === message._id);
                const previousMessage = validMessages[currentMessageIndexInValid - 1];
                const nextMessage = validMessages[currentMessageIndexInValid + 1];

                // Мы также должны убедиться, что обращаемся к свойствам sender безопасно
                const getSenderId = (msg) => msg.sender && (typeof msg.sender === 'object' ? msg.sender._id : msg.sender);
                const isPreviousSenderSame = previousMessage && (getSenderId(previousMessage) === senderId);
                const isNextSenderSame = nextMessage && (getSenderId(nextMessage) === senderId);

                const isFirstMessageOfGroup = !isPreviousSenderSame;
                const isLastMessageOfGroup = !isNextSenderSame;

                const messageTime = message.createdAt
                    ? format(new Date(message.createdAt), 'HH:mm', { locale: ru })
                    : '';
                
                // ⭐ ОБНОВЛЕННЫЕ СТИЛИ для пузырей
                let messageClass;
                if (message.isDeleted) {
                    messageClass = 'bg-neutral-600 text-neutral-400 italic rounded-xl';
                } else if (isMyMessage) {
                    messageClass = `bg-blue-500 text-white rounded-xl ${isFirstMessageOfGroup ? 'rounded-tr-lg' : ''} ${isLastMessageOfGroup ? 'rounded-br-xl' : 'rounded-br-lg'}`;
                    // Чтобы сообщения в группе имели одинаковый радиус, кроме крайних
                    messageClass = `bg-blue-500 text-white rounded-xl 
                        ${isFirstMessageOfGroup ? 'rounded-tr-lg' : 'rounded-tr-xl'}
                        ${isLastMessageOfGroup ? 'rounded-br-xl' : 'rounded-br-lg'}
                        ${!isFirstMessageOfGroup && !isLastMessageOfGroup ? 'rounded-r-lg' : ''}
                    `;
                } else {
                    messageClass = `bg-neutral-700 text-gray-100 rounded-xl 
                        ${isFirstMessageOfGroup ? 'rounded-tl-lg' : 'rounded-tl-xl'}
                        ${isLastMessageOfGroup ? 'rounded-bl-xl' : 'rounded-bl-lg'}
                        ${!isFirstMessageOfGroup && !isLastMessageOfGroup ? 'rounded-l-lg' : ''}
                    `;
                }

                const receiverUserId = receiverData._id;
                const isReadByReceiver = message.readBy && message.readBy.includes(receiverUserId);
                const isDelivered = message.delivered; 

                // ⭐ Определяем отступ для сообщений в группе
                const groupMargin = isFirstMessageOfGroup ? 'mt-4' : 'mt-1';
                // Определяем, показывать ли аватар
                const showAvatar = isFirstMessageOfGroup && !isMyMessage;


                return (
                    <div
                        key={message._id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} ${groupMargin}`}
                    >
                        {/* Аватар собеседника */}
                        {showAvatar && senderData?.profilePicture && (
                            <img
                                src={senderData.profilePicture || '/default-avatar.jpg'}
                                alt="Аватар"
                                className="w-8 h-8 rounded-full mr-2 self-end object-cover"
                            />
                        )}
                        {/* Пробел, если аватар не отображается, чтобы выровнять группу */}
                        {!showAvatar && !isMyMessage && <div className="w-8 h-8 mr-2 self-end" />}

                        {/* Контейнер сообщения */}
                        <div className={`group flex items-end relative max-w-[80%] md:max-w-md ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Пузырь сообщения */}
                            <div className={`p-2 sm:p-3 max-w-full text-wrap ${messageClass}`}>
                                <p className={`text-sm sm:text-base break-words whitespace-pre-wrap ${message.isDeleted ? 'font-light' : ''}`}>
                                    {message.isDeleted ? 'Данное сообщение было удалено' : parseMessageText(message.text)}
                                </p>
                                
                                {/* Время и статус */}
                                <div className={`flex justify-end items-center text-xs mt-1 ${isMyMessage ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {messageTime}
                                    {isMyMessage && !message.isDeleted && (
                                        <div className="inline-block ml-1 sm:ml-2">
                                            {/* ⭐ Улучшенная стилизация для статусов */}
                                            {isReadByReceiver ? (
                                                <IoCheckmarkDoneSharp className="text-sm sm:text-base text-green-400" /> // Прочитано (зеленый акцент)
                                            ) : isDelivered ? (
                                                <IoCheckmarkDoneSharp className="text-sm sm:text-base text-blue-200 opacity-80" /> // Доставлено
                                            ) : (
                                                <IoCheckmarkSharp className="text-sm sm:text-base text-blue-200 opacity-60" /> // Отправлено
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Кнопка опций (⋮) - только для моих сообщений, если не удалено */}
                            {isMyMessage && !message.isDeleted && (
                                <div className="relative" ref={messageMenuOpenId === message._id ? menuRef : null}>
                                    <button
                                        onClick={() => setMessageMenuOpenId(messageMenuOpenId === message._id ? null : message._id)}
                                        className={`ml-1 p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition duration-150 
                                            ${messageMenuOpenId === message._id ? 'visible bg-neutral-700' : 'opacity-0 group-hover:opacity-100'}`} // Показываем при наведении
                                        aria-label="Опции сообщения"
                                    >
                                        <HiOutlineDotsVertical className="text-lg" />
                                    </button>
                                    
                                    {/* Выпадающее меню */}
                                    {messageMenuOpenId === message._id && (
                                        <div className="absolute top-0 transform -translate-y-full -mt-2 right-0 w-40 bg-neutral-700 border border-neutral-600 rounded-lg shadow-xl overflow-hidden z-30">
                                            <button
                                                onClick={() => handleDeleteSingleMessage(message._id)}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-600 transition duration-150"
                                            >
                                                Удалить для всех
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />

            {/* ⭐ Модальное окно загрузки для удаления */}
            <LoadingModal isOpen={isDeletingLoading} message="Удаление сообщения..." />
        </div>
    );
};
// ⭐ ОБНОВЛЯЕМ PROP-TYPES
MessageList.propTypes = {
    openConfirmModal: PropTypes.func.isRequired,
    closeConfirmModal: PropTypes.func.isRequired,
    receiverData: PropTypes.object.isRequired,
    // currentUserId: PropTypes.string.isRequired, // Удалено, т.к. user._id берётся из Redux
};

export default MessageList;