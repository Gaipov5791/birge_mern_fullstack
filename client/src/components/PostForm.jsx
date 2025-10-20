// import React, { useState, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { createPost } from '../redux/features/posts/postThunks';
// import { FaPaperPlane, FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';
// import { toastSuccess, toastError, toastInfo } from '../redux/features/notifications/notificationSlice';

// function PostForm() {
//     const [newPostText, setNewPostText] = useState('');
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [file, setFile] = useState(null);
//     const [previewUrl, setPreviewUrl] = useState(null);

//     const MAX_FILES = 5;
    
//     const { user } = useSelector((state) => state.auth);
//     const { isPosting } = useSelector((state) => state.posts);
    
//     const dispatch = useDispatch();

//     const handleFileChange = useCallback((e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile) {
//             if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
//                 setFile(selectedFile);
//                 // Создаем временный URL для превью
//                 setPreviewUrl(URL.createObjectURL(selectedFile)); 
//             } else {
//                 dispatch(toastError('Поддерживаются только изображения и видео.'));
//                 e.target.value = null;
//             }
//         }
//     }, []);

//     const handleRemoveFile = useCallback(() => {
//         if (previewUrl) {
//             URL.revokeObjectURL(previewUrl); // Очищаем временный URL
//         }
//         setFile(null);
//         setPreviewUrl(null);
//     }, [previewUrl]);

//     const handleSubmit = useCallback(async (e) => {
//         e.preventDefault();

//         if (!user) {
//             dispatch(toastError('Пожалуйста, войдите, чтобы создать пост.'));
//             return;
//         }

//         if (!newPostText.trim() && !file) {
//             dispatch(toastInfo('Пожалуйста, введите текст или выберите файл для поста.'));
//             return;
//         }

//         const formData = new FormData();
//         formData.append('text', newPostText);
//         if (file) {
//             formData.append('file', file);
//         }

//         try {
//             await dispatch(createPost(formData)).unwrap();
//             dispatch(toastSuccess("Пост успешно опубликован!"));
            
//             // Сбрасываем состояние формы после успешной публикации
//             setNewPostText('');
//             if (previewUrl) {
//                 URL.revokeObjectURL(previewUrl);
//             }
//             setFile(null);
//             setPreviewUrl(null);
//             selectedFiles.length = 0;

//         } catch (error) {
//             dispatch(toastError(error || "Не удалось опубликовать пост."));
//         }
//     }, [newPostText, file, user, dispatch, previewUrl]);

//     if (!user) {
//         return null;
//     }

//     return (
//         // ⭐ Контейнер: Тёмный фон, синяя тень, скругленные углы
//         <div className="w-full max-w-4xl mx-auto bg-neutral-800 p-4 sm:p-6 rounded-xl shadow-2xl shadow-blue-900/50 border border-neutral-700 mb-8 hover:border-blue-600 transform transition-all duration-700 ease-out">
//             {/* ⭐ Заголовок: Светлый текст, синий акцент */}
//             <h3 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6 text-center">
//                 Что нового?
//             </h3>
//             <form onSubmit={handleSubmit}>
//                 {/* ⭐ Textarea: Тёмный фон, светлый текст, синий фокус */}
//                 <textarea
//                     className="w-full p-4 border border-neutral-600 
//                         bg-neutral-700 text-gray-100  rounded-lg 
//                         focus:outline-none focus:ring-2 focus:ring-blue-500 
//                         focus:border-blue-500 mb-4 text-sm sm:text-base transition duration-200 resize-none
//                     "
//                     rows="4"
//                     placeholder="Что у вас нового? (Совет: используйте #хештеги, чтобы сделать ваш пост заметнее!)"
//                     value={newPostText}
//                     onChange={(e) => setNewPostText(e.target.value)}
//                     disabled={isPosting}
//                 ></textarea>

//                 {file && (
//                     // ⭐ Превью файла: Тёмный фон, синяя пунктирная рамка
//                     <div className="relative mb-4 p-4 border border-dashed border-blue-500/50 bg-neutral-700 rounded-xl">
//                         {file.type.startsWith('image/') ? (
//                             <img src={previewUrl} alt="Превью" className="max-w-full max-h-80 object-contain rounded-lg mx-auto" />
//                         ) : (
//                             <video src={previewUrl} controls className="max-w-full max-h-80 object-contain rounded-lg mx-auto" />
//                         )}
//                         <button
//                             type="button"
//                             onClick={handleRemoveFile}
//                             // ⭐ Кнопка удаления: Тёмный фон, красный крестик
//                             className="absolute top-4 right-4 bg-neutral-900/70 text-red-400 rounded-full p-2 hover:bg-neutral-900 transition-all shadow-md"
//                         >
//                             <FaTimes />
//                         </button>
//                     </div>
//                 )}
                
//                 <div className="flex space-x-4 items-center">
//                     {/* ⭐ Кнопка публикации: Синий акцент, тень */}
//                     <button
//                         type="submit"
//                         className={`
//                             flex-grow flex items-center justify-center py-3 px-4 border border-transparent 
//                             uppercase text-base font-medium rounded-lg text-white transition duration-200 
//                             shadow-md 
//                             ${isPosting ? 'bg-blue-400 cursor-not-allowed shadow-blue-400/20' : 
//                                         'bg-blue-600 hover:bg-blue-700 shadow-blue-500/40'} 
//                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
//                             focus:ring-offset-neutral-800 cursor-pointer`}
//                         disabled={isPosting || (!newPostText.trim() && !file)}
//                     >
//                         {isPosting ? (
//                             <>
//                                 {/* <FaSpinner className="animate-spin mr-3 text-sm sm:text-lg" /> */}
//                                 <span>Публикация...</span>
//                             </>
//                         ) : (
//                             <>
//                                 <FaPaperPlane className="mr-3 text-md sm:text-lg" />
//                                 <span className='text-sm sm:text-base'>Опубликовать</span>
//                             </>
//                         )}
//                     </button>
                    
//                     <input
//                         id="file-upload"
//                         type="file"
//                         accept="image/*,video/*"
//                         multiple
//                         onChange={handleFileChange}
//                         className="hidden"
//                         disabled={isPosting || selectedFiles.length >= MAX_FILES}
//                     />
//                     {/* ⭐ Кнопка загрузки файла: Вторичный акцент, синяя иконка */}
//                     <label 
//                         htmlFor="file-upload" 
//                         className={`flex items-center justify-center w-12 h-12 rounded-lg text-white bg-neutral-700 hover:bg-neutral-600 transition duration-200 cursor-pointer shadow-md ${isPosting && 'opacity-50 cursor-not-allowed'}`}
//                     >
//                         <FaPlus className="text-blue-400 text-md sm:text-lg" />
//                     </label>
//                 </div>
//                 {selectedFiles.length > 0 && selectedFiles.length < MAX_FILES && (
//                      <p className='text-xs text-gray-400 mt-2 text-right'>
//                         Добавлено {selectedFiles.length} из {MAX_FILES} файлов.
//                      </p>
//                 )}
//             </form>
//         </div>
//     );
// }

// export default PostForm;

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../redux/features/posts/postThunks'; // Ваш реальный thunk
import { FaPaperPlane, FaPlus, FaTimes, FaSpinner } from 'react-icons/fa'; // Ваши реальные иконки
import { toastSuccess, toastError, toastInfo } from '../redux/features/notifications/notificationSlice'; // Ваши реальные toast actions

// Максимальное количество файлов для загрузки
const MAX_FILES = 5;

function PostForm() {
    const [newPostText, setNewPostText] = useState('');
    // ⭐ Только массивное состояние для файлов
    const [selectedFiles, setSelectedFiles] = useState([]); 
    
    // ⭐ Ваши реальные селекторы Redux
    const { user } = useSelector((state) => state.auth);
    const { isPosting } = useSelector((state) => state.posts);
    
    const dispatch = useDispatch();

    // ⭐ НОВОЕ: Создание URL превью для всех файлов
    const previewUrls = useMemo(() => {
        return selectedFiles.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name
        }));
    }, [selectedFiles]);
    
    // ⭐ НОВОЕ: Эффект для очистки временных URL-адресов
    useEffect(() => {
        // Очистка всех временных URL при размонтировании
        return () => {
            previewUrls.forEach(p => URL.revokeObjectURL(p.url));
        };
    }, [previewUrls]); 

    // ⭐ ИЗМЕНЕНИЕ: Логика для выбора нескольких файлов
    const handleFileChange = useCallback((e) => {
        const newFiles = Array.from(e.target.files);
        
        const validFiles = newFiles.filter(file => 
            file.type.startsWith('image/') || file.type.startsWith('video/')
        );
        
        const totalFilesCount = selectedFiles.length + validFiles.length;
        
        if (totalFilesCount > MAX_FILES) {
            dispatch(toastError(`Вы можете выбрать не более ${MAX_FILES} файлов.`));
            const availableSpace = MAX_FILES - selectedFiles.length;
            setSelectedFiles(prev => [...prev, ...validFiles.slice(0, availableSpace)]);
        } else {
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }
        
        if (validFiles.length < newFiles.length) {
             dispatch(toastError('Некоторые выбранные файлы имеют неподдерживаемый формат.'));
        }
        
        e.target.value = null; 

    }, [dispatch, selectedFiles.length]);

    // ⭐ ИЗМЕНЕНИЕ: Удаление файла по индексу
    const handleRemoveFile = useCallback((indexToRemove) => {
        const urlToRevoke = previewUrls[indexToRemove]?.url;
        if (urlToRevoke) {
            URL.revokeObjectURL(urlToRevoke); 
        }

        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    }, [previewUrls]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!user) {
            dispatch(toastError('Пожалуйста, войдите, чтобы создать пост.'));
            return;
        }

        // Проверяем selectedFiles
        if (!newPostText.trim() && selectedFiles.length === 0) {
            dispatch(toastInfo('Пожалуйста, введите текст или выберите файл(ы) для поста.'));
            return;
        }

        const formData = new FormData();
        formData.append('text', newPostText);
        
        // КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Добавляем ВСЕ файлы в FormData
        if (selectedFiles.length > 0) {
            selectedFiles.forEach((file) => {
                // ВАЖНО: Используйте ОДИН И ТОТ ЖЕ ключ ('files') для всех файлов.
                formData.append('files', file); 
            });
        }

        try {
            // Ваш реальный Redux thunk
            await dispatch(createPost(formData)).unwrap();
            dispatch(toastSuccess("Пост успешно опубликован!"));
            
            // Сброс состояния формы после успешной публикации
            setNewPostText('');
            setSelectedFiles([]); 
            // useEffect позаботится об очистке старых URL превью

        } catch (error) {
            // Предполагается, что error - это строка или объект с полем message
            const errorMessage = error.message || error.toString() || "Не удалось опубликовать пост.";
            dispatch(toastError(errorMessage));
        }
    }, [newPostText, selectedFiles, user, dispatch]);


    if (!user) {
        return null;
    }

    const isSubmitDisabled = isPosting || (!newPostText.trim() && selectedFiles.length === 0);
    const canSelectMoreFiles = selectedFiles.length < MAX_FILES;

    return (
        <div className="w-full max-w-4xl mx-auto bg-neutral-800 p-4 sm:p-6 rounded-xl shadow-2xl shadow-blue-900/50 border border-neutral-700 mb-8 hover:border-blue-600 transform transition-all duration-700 ease-out">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6 text-center">
                Что нового?
            </h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full p-4 border border-neutral-600 
                        bg-neutral-700 text-gray-100  rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                        focus:border-blue-500 mb-4 text-sm sm:text-base transition duration-200 resize-none
                    "
                    rows="4"
                    placeholder="Что у вас нового? (Совет: используйте #хештеги, чтобы сделать ваш пост заметнее!)"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    disabled={isPosting}
                ></textarea>

                {/* Рендеринг всех превью в виде адаптивной сетки */}
                {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 p-4 border border-dashed border-blue-500/50 bg-neutral-700 rounded-xl">
                        {previewUrls.map((preview, index) => (
                            <div key={preview.url} className="relative w-full aspect-square rounded-lg overflow-hidden border border-neutral-600 shadow-xl">
                                {preview.type.startsWith('image/') ? (
                                    <img 
                                        src={preview.url} 
                                        alt={`Превью ${index + 1}`} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <video 
                                        src={preview.url} 
                                        controls 
                                        className="w-full h-full object-cover bg-black" 
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    title="Удалить файл"
                                    className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 
                                            hover:bg-red-700 transition-all shadow-lg text-xs z-10"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="flex space-x-4 items-center">
                    <button
                        type="submit"
                        className={`
                            flex-grow flex items-center justify-center py-3 px-4 border border-transparent 
                            uppercase text-base font-medium rounded-lg text-white transition duration-200 
                            shadow-md 
                            ${isSubmitDisabled ? 'bg-blue-400 cursor-not-allowed shadow-blue-400/20' : 
                                'bg-blue-600 hover:bg-blue-700 shadow-blue-500/40'} 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                            focus:ring-offset-neutral-800 cursor-pointer`}
                        disabled={isSubmitDisabled}
                    >
                        {isPosting ? (
                            <>
                                <FaSpinner className="animate-spin mr-3 text-sm sm:text-lg" />
                                <span>Публикация...</span>
                            </>
                        ) : (
                            <>
                                <FaPaperPlane className="mr-3 text-md sm:text-lg" />
                                <span className='text-sm sm:text-base'>Опубликовать</span>
                            </>
                        )}
                    </button>
                    
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isPosting || !canSelectMoreFiles}
                    />
                    <label 
                        htmlFor="file-upload" 
                        className={`flex items-center justify-center w-12 h-12 rounded-lg text-white bg-neutral-700 transition duration-200 shadow-md 
                            ${isPosting || !canSelectMoreFiles ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-600 cursor-pointer'}`}
                    >
                        <FaPlus className="text-blue-400 text-md sm:text-lg" />
                    </label>
                </div>
                {selectedFiles.length > 0 && (
                     <p className='text-xs text-gray-400 mt-2 text-right'>
                        Добавлено {selectedFiles.length} из {MAX_FILES} файлов.
                     </p>
                )}
            </form>
        </div>
    );
}

export default PostForm;