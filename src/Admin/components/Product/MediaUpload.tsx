import { Upload, X, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';

interface MediaUploadProps {
    mediaFiles: (File | string)[];
    errors?: string;
    onMediaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveMedia: (index: number) => void;
    getMediaUrl: (media: File | string) => string;
    getMaxMediaCount?: () => number;
}

export default function MediaUpload({
    mediaFiles,
    errors,
    onMediaChange,
    onRemoveMedia,
    getMediaUrl,
    getMaxMediaCount = () => 5
}: MediaUploadProps) {
    const maxMediaCount = getMaxMediaCount();

    const isVideo = (media: File | string): boolean => {
        if (typeof media === 'string') {
            // For existing media URLs, check the file extension
            return media.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/i) !== null;
        } else {
            // For File objects, check the MIME type
            return media.type.startsWith('video/');
        }
    };

    return (
        <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <ImageIcon size={18} />
                Product Media (Images & Videos - Max {maxMediaCount})
            </label>
            <div className="mt-2">
                <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={onMediaChange}
                    className="hidden"
                    id="media-upload"
                    multiple
                />
                <label
                    htmlFor="media-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-700 hover:bg-amber-50 transition-colors"
                >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload images/videos</span>
                    <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF, MP4, MOV up to {maxMediaCount} files (50MB max each)
                    </span>
                </label>
            </div>
            {errors && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors}
                </p>
            )}
            {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                    {mediaFiles.map((media, index) => (
                        <div key={index} className="relative group">
                            {isVideo(media) ? (
                                // Video preview
                                <div className="w-full h-32 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                                    <Video size={24} className="text-gray-500" />
                                    <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                        Video
                                    </span>
                                </div>
                            ) : (
                                // Image preview
                                <img
                                    src={getMediaUrl(media)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => onRemoveMedia(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}