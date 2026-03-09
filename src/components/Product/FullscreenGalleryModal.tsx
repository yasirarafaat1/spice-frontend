import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { isVideoUrl } from '../../utils/mediaUtils';
import VideoPlayer from './VideoPlayer';

interface FullscreenGalleryModalProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
    productName: string;
}

export default function FullscreenGalleryModal({
    images,
    initialIndex,
    onClose,
    productName
}: FullscreenGalleryModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const currentMedia = images[currentIndex];

    const goToPrevious = () => {
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight') {
            goToNext();
        }
    };

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-white flex items-center justify-center"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Close button - Top right */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full transition-all duration-200"
                aria-label="Close gallery"
            >
                <X size={24} className="text-gray-800" />
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-0 transition-all duration-200"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={24} className="text-gray-800" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-0 transition-all duration-200"
                        aria-label="Next image"
                    >
                        <ChevronRight size={24} className="text-gray-800" />
                    </button>
                </>
            )}

            {/* Main media display */}
            <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center p-10">
                <div className="relative w-full h-full flex items-center justify-center">
                    {isVideoUrl(currentMedia) ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <VideoPlayer
                                src={currentMedia}
                                className="max-w-full max-h-full w-auto h-auto object-contain"
                                disableOverlayClick={false}
                            />
                        </div>
                    ) : (
                        <img
                            src={currentMedia}
                            alt={`${productName} - Image ${currentIndex + 1}`}
                            className="max-w-full max-h-full w-auto h-auto object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Image counter */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1.5 rounded-full text-sm font-medium text-gray-800">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}