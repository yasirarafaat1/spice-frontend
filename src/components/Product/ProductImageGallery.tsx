import { isVideoUrl } from '../../utils/mediaUtils';
import VideoPlayer from './VideoPlayer';
import { Maximize2, PlayCircle } from 'lucide-react';

interface ProductImageGalleryProps {
    images: string[];
    selectedImage: number;
    onImageSelect: (index: number) => void;
    productName: string;
    onImageClick?: (index: number) => void;
}

export default function ProductImageGallery({
    images,
    selectedImage,
    onImageSelect,
    productName,
    onImageClick
}: ProductImageGalleryProps) {
    const mainMedia = images[selectedImage] || images[0] || '';

    return (
        <div className="flex flex-col gap-4 sm:gap-6">
            {/* --- Main Media Display --- */}
            <div
                className="relative aspect-square rounded-[2rem] overflow-hidden bg-[#111] border border-white/5 cursor-zoom-in group shadow-2xl"
                onClick={() => onImageClick && onImageClick(selectedImage)}
            >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                {isVideoUrl(mainMedia) ? (
                    <div className="w-full h-full">
                        <VideoPlayer
                            src={mainMedia}
                            className="w-full h-full object-cover"
                            disableOverlayClick={false}
                        />
                    </div>
                ) : (
                    <img
                        src={mainMedia}
                        alt={productName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x800?text=Pure+Fire+Spices';
                        }}
                    />
                )}

                {/* Fullscreen Overlay Label */}
                <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <Maximize2 size={12} className="text-orange-500" />
                    Enlarge View
                </div>
            </div>

            {/* --- Thumbnails Grid --- */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 sm:grid-cols-4 gap-3">
                    {images.map((media, index) => {
                        const isSelected = selectedImage === index;
                        const isVideo = isVideoUrl(media);

                        return (
                            <button
                                key={index}
                                onClick={() => onImageSelect(index)}
                                className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
                                    isSelected
                                        ? 'border-orange-600 ring-4 ring-orange-600/20 scale-95'
                                        : 'border-white/5 opacity-50 hover:opacity-100 hover:border-white/20'
                                }`}
                            >
                                {isVideo ? (
                                    <div className="w-full h-full relative bg-[#1a1a1a] flex items-center justify-center">
                                        {/* Simple placeholder for video thumb to avoid heavy loading */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-orange-600/10">
                                            <PlayCircle size={20} className="text-orange-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={media}
                                        alt={`${productName} view ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Media';
                                        }}
                                    />
                                )}
                                
                                {/* Selected Indicator Dot */}
                                {isSelected && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-orange-600 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}