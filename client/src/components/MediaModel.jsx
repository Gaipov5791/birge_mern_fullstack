import React, { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const IMAGE_FALLBACK_DATA =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='24' fill='%236b7280'>Image not found</text></svg>";

function MediaModal({ mediaUrl, mediaType, onClose }) {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (mediaUrl) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mediaUrl]);

  useEffect(() => {
    if (mediaType === 'video' && mediaUrl && videoRef.current) {
      const v = videoRef.current;
      const t = setTimeout(async () => {
        try {
          await v.play();
        } catch {
          try {
            v.muted = true;
            await v.play();
          } catch {
            // оставим пользователю кнопку Play
          }
        }
      }, 0);
      return () => clearTimeout(t);
    }
  }, [mediaType, mediaUrl]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!mediaUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl z-50 hover:text-gray-300 transition-colors"
        >
          <FaTimes />
        </button>

        {mediaType === 'image' && (
          <img
            src={mediaUrl}
            alt="Полноэкранное изображение"
            className="max-w-full max-h-[85vh] object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = IMAGE_FALLBACK_DATA;
            }}
          />
        )}

        {mediaType === 'video' && !videoError && (
          <video
            ref={videoRef}
            src={mediaUrl}
            controls
            playsInline
            className="max-w-full max-h-[85vh] object-contain"
            onError={() => setVideoError(true)}
          />
        )}

        {mediaType === 'video' && videoError && (
          <div className="flex items-center justify-center w-[80vw] max-w-[800px] h-[45vw] max-h-[450px] bg-gray-200 rounded-md text-gray-600 text-center px-6">
            Видео недоступно или повреждено.
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaModal;

