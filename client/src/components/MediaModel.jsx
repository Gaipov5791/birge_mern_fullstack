import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const getImageFallbackData = (label) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='24' fill='%236b7280'>${encodeURIComponent(label)}</text></svg>`;

function MediaModal({ mediaUrl, mediaType, onClose }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const imageFallbackData = useMemo(() => getImageFallbackData(t('common.imageNotFound')), [t]);

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
      const timer = setTimeout(async () => {
        try {
          await v.play();
        } catch {
          try {
            v.muted = true;
            await v.play();
          } catch {
            // leave Play button for user
          }
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mediaType, mediaUrl]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!mediaUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div className="relative flex items-center justify-center w-full h-full max-w-[min(80vw,860px)] max-h-[75vh]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white text-2xl z-50 hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
          aria-label={t('common.close')}
        >
          <FaTimes />
        </button>

        {mediaType === 'image' && (
          <img
            src={mediaUrl}
            alt={t('media.fullscreenImage')}
            className="max-w-full max-h-[68vh] w-auto h-auto object-contain rounded-lg"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imageFallbackData;
            }}
          />
        )}

        {mediaType === 'video' && !videoError && (
          <video
            ref={videoRef}
            src={mediaUrl}
            controls
            playsInline
            className="max-w-full max-h-[68vh] w-auto h-auto object-contain rounded-lg"
            onError={() => setVideoError(true)}
          />
        )}

        {mediaType === 'video' && videoError && (
          <div className="flex items-center justify-center w-full max-w-lg aspect-video bg-gray-200 rounded-md text-gray-600 text-center px-6">
            {t('media.videoUnavailable')}
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaModal;
