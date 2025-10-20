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

const BACKEND_URL = 'http://localhost:5000';

// ФУНКЦИЯ ДЛЯ ПАРСИНГА ТЕКСТА ПОСТА НА ССЫЛКИ (Остается без изменений)
const parsePostText = (text) => {
    // ... ваш код parsePostText
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            let href = part;
            if (href.startsWith('www.')) {
                href = `http://${href}`;
            } else if (!href.startsWith('http')) {
                href = `http://${href}`;
            }

            return (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-medium break-words" 
                >
                    {part}
                </a>
            );
        }
        return part; 
    });
};


function PostContent({ post }) {
    const [modalData, setModalData] = useState({ url: null, type: null });
    
    const openMediaModal = useCallback((url, type) => {
        const fullUrl = `${BACKEND_URL}${url}`;
        setModalData({ url: fullUrl, type });
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


    // ⭐ 2. Компонент для рендеринга ОДНОГО слайда
    const renderSlideContent = useCallback((item) => {
        const fullUrl = `${BACKEND_URL}${item.url}`;

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
                    <p className="text-gray-300 mb-4 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                        {parsePostText(post.text)}
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


