import React, { useState, useCallback, useMemo } from 'react';
// ⭐ Импорт компонентов Swiper и необходимых модулей
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// ⭐ Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { FaPlay } from 'react-icons/fa'; // FaPlay нужен для видео
import MediaModal from '../../components/MediaModel';

// Встроенный плейсхолдер
const IMAGE_FALLBACK_DATA =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%231f2937'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='24' fill='%239ca3af'>Image not found</text></svg>"; 

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BACKEND_URL = `${BASE_URL}`; // Базовый URL вашего бэкенда

// ⭐ КОНСТАНТА: Максимальное количество символов для отображения по умолчанию
const TEXT_LIMIT = 300; 
const TRUNCATE_POINT = TEXT_LIMIT; // Точка, после которой обрезаем текст

// ⭐ НОВАЯ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ БЕЗОПАСНОГО URL
const getSafeUrl = (url, backendUrl) => {
    // Если URL уже начинается с http(s), возвращаем его как есть.
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return url;
    }
    // Если это относительный путь (старая локальная логика), добавляем BASE_URL
    return `${backendUrl}${url}`;
};

// ФУНКЦИЯ ДЛЯ ПАРСИНГА ТЕКСТА ПОСТА НА ССЫЛКИ И ПЕРЕНОСЫ СТРОК
const parsePostText = (text) => {
    if (!text) return null;
    
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const parts = text.split(urlRegex);

    const parsedElements = parts.map((part, index) => {
        // 1. Обработка ссылок
        if (part.match(urlRegex)) {
            let href = part;
            // ... (Ваша логика для формирования href остается без изменений)
            if (href.startsWith('www.')) {
                href = `http://${href}`;
            } else if (!href.startsWith('http')) {
                href = `http://${href}`;
            }

            return (
                <a
                    key={`link-${index}`} // Уникальный ключ
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-medium break-words" 
                >
                    {part}
                </a>
            );
        }
        
        // 2. Обработка переносов строк в обычном тексте (самый важный шаг)
        // Разбиваем часть текста по переводам строки
        const textSegments = part.split('\n');
        
        return textSegments.map((segment, segIndex) => (
            <React.Fragment key={`seg-${index}-${segIndex}`}>
                {/* Выводим текстовый сегмент */}
                {segment}
                {/* Добавляем <br> после каждого сегмента, кроме последнего */}
                {segIndex < textSegments.length - 1 && <br />}
            </React.Fragment>
        ));
    });

    // Поскольку мы теперь обрабатываем переносы строк с помощью <br />, 
    // класс whitespace-pre-wrap становится НЕОБЯЗАТЕЛЬНЫМ, но и не повредит.
    return parsedElements;
};


function PostContent({ post }) {
    const [modalData, setModalData] = useState({ url: null, type: null });

    // ⭐ НОВОЕ СОСТОЯНИЕ: Для управления видимостью полного текста
    const [isExpanded, setIsExpanded] = useState(false);

    // ⭐ НОВАЯ ФУНКЦИЯ: Переключение состояния
    const toggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);
    
    const openMediaModal = useCallback((url, type) => {
        // Теперь используем вспомогательную функцию
        const safeUrl = getSafeUrl(url, BACKEND_URL); 
        setModalData({ url: safeUrl, type });
    }, []);
    
    const closeMediaModal = useCallback(() => setModalData({ url: null, type: null }), []);

    // ⭐ 1. Формирование единого массива медиафайлов
    const mediaItems = useMemo(() => {
        // Проверяем новое поле post.media. Это уже массив!
        if (post.media && Array.isArray(post.media)) {
            // ⭐ ВОЗВРАЩАЕМ ВЕСЬ МАССИВ post.media НЕТРОНУТЫМ
            // Multer уже предоставил нам объекты { url, type }
            return post.media; 
        }
        
        // ⭐ ЛОГИКА СОВМЕСТИМОСТИ (НЕОБЯЗАТЕЛЬНО, но полезно)
        // Если post.media пуст, но есть старые поля, используем их
        const items = [];
        if (post.image) {
            items.push({ url: post.image, type: 'image' });
        }
        if (post.video) {
            items.push({ url: post.video, type: 'video', videoPoster: post.videoPoster });
        }
        return items;

    // Зависимости: только post.media, потому что image/video/videoPoster теперь устарели
    }, [post.media, post.image, post.video, post.videoPoster]);

    // ⭐ НОВАЯ ЛОГИКА: Форматирование текста
    const renderTextContent = useMemo(() => {
        if (!post.text) return null;

        const needsTruncating = post.text.length > TRUNCATE_POINT;
        let displayContent = post.text;

        // Если текст длинный И не развернут, обрезаем его
        if (needsTruncating && !isExpanded) {
            displayContent = post.text.substring(0, TRUNCATE_POINT);
            // Пытаемся обрезать по последнему пробелу, чтобы избежать обрезания слова
            const lastSpace = displayContent.lastIndexOf(' ');
            if (lastSpace !== -1) {
                displayContent = displayContent.substring(0, lastSpace);
            }
        }
        
        // Рендерим обрезанный/полный текст
        const parsedText = parsePostText(displayContent);

        return (
            <>
                <p className="text-gray-300 whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words">
                    {parsedText}
                    {needsTruncating && !isExpanded && <span>...</span>} 
                </p>
                {needsTruncating && (
                    <button 
                        onClick={toggleExpand}
                        className="text-blue-400 hover:underline text-sm font-semibold mt-1 inline-block"
                    >
                        {isExpanded ? 'свернуть' : 'читать далее'}
                    </button>
                )}
            </>
        );
    }, [post.text, isExpanded, toggleExpand]); // Зависит от текста и состояния


    // ⭐ 2. Компонент для рендеринга ОДНОГО слайда
    const renderSlideContent = useCallback((item) => {
        const fullUrl = getSafeUrl(item.url, BACKEND_URL);

        const isImage = item.type === 'image';
        const isVideo = item.type === 'video';

        // Базовый класс для контейнера медиа
        const containerClass = "relative flex justify-center cursor-pointer p-1 bg-neutral-700 rounded-xl transition duration-300 hover:bg-neutral-600";
        // Класс для самого медиа
        const mediaClass = "max-h-[400px] max-w-full w-auto rounded-lg object-contain shadow-xl shadow-black/50 transition duration-300";


        if (isImage) {
            return (
                <div
                    className={containerClass}
                    onClick={() => openMediaModal(item.url, 'image')}
                >
                    <img
                        src={fullUrl}
                        alt="Изображение поста"
                        className={`block ${mediaClass}`}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = IMAGE_FALLBACK_DATA;
                        }}
                    />
                </div>
            );
        }

        if (isVideo) {
            return (
                <div
                    className={containerClass}
                    onClick={() => openMediaModal(item.url, 'video')}
                >
                    <video
                        src={`${fullUrl}#t=0.1`}
                        poster={item.videoPoster || undefined}
                        preload="metadata"
                        playsInline
                        muted
                        className={`pointer-events-none opacity-90 ${mediaClass}`}
                    />
                    {/* Кнопка Play */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 rounded-full p-5 hover:bg-blue-600/80 transition duration-200">
                            <FaPlay className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }, [openMediaModal]); // Зависит от openMediaModal

    // Если медиа нет, рендерим только текст
    if (mediaItems.length === 0) {
        return (
            <div className='mt-2'>
                {post.text && (
                    <p className="text-gray-300 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                        {parsePostText(post.text)}
                    </p>
                )}
            </div>
        );
    }
    
    // ⭐ 3. Основной рендеринг
    return (
        <>
            <div className='mt-2'>
                {post.text && (
                    <p className="text-gray-300 mb-4 whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words">
                        {renderTextContent}
                    </p>
                )}

                <div className="media-carousel-container max-w-4xl mx-auto overflow-hidden">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        slidesPerView={1}
                        navigation={mediaItems.length > 1} // Включаем навигацию только если слайдов > 1
                        pagination={{ 
                            clickable: true,
                            // Настройка класса для точек, чтобы они не были прозрачными
                            bulletClass: 'swiper-pagination-bullet bg-gray-600 w-2 h-2 rounded-full inline-block cursor-pointer mx-1',
                            bulletActiveClass: 'bg-blue-500', // Активная точка
                        }}
                        loop={false}
                        // Для настройки стилей Swiper, которые не покрыты стандартными CSS
                        className="mySwiper rounded-xl" 
                    >
                        {mediaItems.map((item, index) => (
                            <SwiperSlide key={index}>
                                {renderSlideContent(item)}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            {/* Модальное окно для медиа */}
            <MediaModal
                mediaUrl={modalData.url}
                mediaType={modalData.type}
                onClose={closeMediaModal}
            />
        </>
    );
}

export default PostContent;


