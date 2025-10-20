import React, { useState } from 'react'; // Добавляем useState в импорты
import { FaSave, FaTimes, FaSpinner, FaCamera } from 'react-icons/fa';
import ImageModal from '../ImageModal';

function ProfileHeader({
    userProfile,
    isCurrentUserProfile,
    imagePreviewUrl,
    selectedImageFile,
    isUploadingImage,
    fileInputRef,
    handleFileChange,
    handleImageUpload,
    handleCancelImageChange
}) {

    const defaultProfilePicture = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    const displayPicture = imagePreviewUrl || userProfile?.profilePicture || defaultProfilePicture;

    // Правильное использование React.useState
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="bg-neutral-800 rounded-3xl shadow-xl shadow-neutral-900/50 border-b-4 border-indigo-600 p-6 mb-6 text-center relative">
            {/* Секция аватара */}
            <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                    // Используем displayPicture для отображения корректного изображения
                    src={displayPicture}
                    alt="Профиль"
                    className="w-full h-full rounded-md sm:rounded-lg object-cover border-4 
                        border-indigo-500 cursor-pointer transition-transform 
                        duration-200 hover:scale-105
                    "
                    onClick={openModal} // Открытие модалки при клике на изображение
                />
                {isCurrentUserProfile && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Изменить фото профиля"
                            disabled={isUploadingImage}
                        >
                            {isUploadingImage ? (
                                <FaSpinner className="animate-spin" />
                            ) : (
                                <FaCamera />
                            )}
                        </button>
                    </>
                )}
            </div>
            {isCurrentUserProfile && selectedImageFile && (
                <div className="flex justify-center space-x-2 mb-4">
                    <button
                        onClick={handleImageUpload}
                        className="bg-green-500 text-white text-sm sm:text-base px-3 py-1 rounded hover:bg-green-600 flex items-center"
                        disabled={isUploadingImage}
                    >
                        {isUploadingImage ? (
                            <FaSpinner className="animate-spin mr-1" />
                        ) : (
                            <FaSave className="mr-1" />
                        )}
                        {isUploadingImage ? 'Загрузка...' : 'Загрузить фото'}
                    </button>
                    <button
                        onClick={handleCancelImageChange}
                        className="bg-gray-300 text-gray-700 text-sm sm:text-base px-3 py-1 rounded hover:bg-gray-400 flex items-center"
                        disabled={isUploadingImage}
                    >
                        <FaTimes className="mr-1" /> Отмена фото
                    </button>
                </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{userProfile.username}</h1>
            <p className="text-blue-600 mb-4">{userProfile.email}</p>

            <div className="flex justify-center space-x-6 mb-4">
                <div className="text-center">
                    <span className="block text-xl font-bold text-indigo-400">{userProfile.followers?.length || 0}</span>
                    <span className="text-white text-xs sm:text-base">Подписчиков</span>
                </div>
                <div className="text-center">
                    <span className="block text-xl font-bold text-indigo-400">{userProfile.following?.length || 0}</span>
                    <span className="text-white text-xs sm:text-base">Подписок</span>
                </div>
            </div>
            {/* Модальное окно для просмотра изображения */}
            <ImageModal
                isOpen={isModalOpen} // Передаем состояние модального окна
                imageUrl={displayPicture} // Передаем URL изображения
                onClose={closeModal}
            />
        </div>
    );
}

export default ProfileHeader;