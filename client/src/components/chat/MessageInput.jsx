import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane } from 'react-icons/fa';
import {
    sendMessage,
    startTyping,
    stopTyping,
} from '../../redux/actions/chatActions';
import PropTypes from 'prop-types';


const MessageInput = ({ onTypingStatusChange }) => { // ⭐ Добавил пропс для внешнего уведомления (если нужно)
    const [messageInput, setMessageInput] = useState('');
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { userProfile: receiverData } = useSelector((state) => state.users);

    const textareaRef = useRef(null); 
    const typingTimeoutRef = useRef(null);

    // ⭐ Эффект для автоматического изменения высоты textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Сброс высоты
            // Устанавливаем высоту в зависимости от scrollHeight, ограничивая максимальной (120px)
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [messageInput]);

    // Эффект очистки таймера при размонтировании
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleTyping = (e) => {
        const text = e.target.value;
        setMessageInput(text);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (receiverData?._id) {
            if (text) {
                // Отправляем 'startTyping' только при первом вводе или если статус уже не был установлен
                // (Redux/Socket должны обрабатывать дубликаты, но мы всё равно посылаем для сброса таймера)
                dispatch(startTyping({ senderId: user._id, receiverId: receiverData._id }));
                if (onTypingStatusChange) onTypingStatusChange(true);

                // Устанавливаем новый таймер для остановки "набирает"
                typingTimeoutRef.current = setTimeout(() => {
                    dispatch(stopTyping({ senderId: user._id, receiverId: receiverData._id }));
                    if (onTypingStatusChange) onTypingStatusChange(false);
                }, 3000); // 3 секунды без ввода
            } else {
                // Если текст очищен, сразу отправляем событие stoppedTyping
                dispatch(stopTyping({ senderId: user._id, receiverId: receiverData._id }));
                if (onTypingStatusChange) onTypingStatusChange(false);
            }
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        const trimmedMessage = messageInput.trim();
        
        if (!trimmedMessage || !receiverData?._id) {
            return;
        }

        const messageDataToSend = {
            sender: user._id,
            receiver: receiverData._id,
            text: trimmedMessage,
        };

        dispatch(sendMessage(messageDataToSend));
        setMessageInput(''); 

        // Останавливаем "печатает" после отправки сообщения
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (receiverData?._id) {
            dispatch(stopTyping({ senderId: user._id, receiverId: receiverData._id }));
            if (onTypingStatusChange) onTypingStatusChange(false);
        }
    };

    // Обработчик для клавиши Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            handleSendMessage(e);
        }
    };

    return (
        // ⭐ Обновленная стилизация: bg-neutral-800, border-t для четкого отделения
        <div className="bg-neutral-800 p-3 sm:p-4 flex-shrink-0 border-t border-neutral-700">
            <form onSubmit={handleSendMessage} className="flex items-end">
                <textarea
                    ref={textareaRef} 
                    value={messageInput}
                    onChange={handleTyping}
                    onKeyDown={handleKeyPress} 
                    placeholder="Написать сообщение..."
                    rows={1} 
                    // ⭐ Улучшенный дизайн поля ввода
                    className="flex-1 py-2 px-4 rounded-xl bg-neutral-700 text-white 
                               placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                               transition-all text-base resize-none overflow-hidden border border-transparent 
                               hover:border-neutral-600 focus:border-blue-500" 
                    style={{ maxHeight: '120px', minHeight: '40px' }} // ⭐ Минимальная высота
                />
                <button
                    type="submit"
                    disabled={!messageInput.trim()} // ⭐ Делаем кнопку неактивной, если нет текста
                    className={`ml-3 p-3 sm:p-4 rounded-full transition-all duration-200 shadow-md flex items-center justify-center
                        ${messageInput.trim() 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white transform hover:scale-105'
                            : 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                        }`}
                    aria-label="Отправить сообщение"
                >
                    <FaPaperPlane className="text-lg sm:text-xl" />
                </button>
            </form>
        </div>
    );
}

MessageInput.propTypes = {
    onTypingStatusChange: PropTypes.func, // Опциональный пропс
};

export default MessageInput;