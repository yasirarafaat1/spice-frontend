/**
 * Utility functions for handling media (images and videos)
 */

/**
 * Check if a URL points to a video file based on file extension
 * @param url - The URL to check
 * @returns true if the URL points to a video file, false otherwise
 */
export const isVideoUrl = (url: string): boolean => {
    if (!url) return false;

    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
    const lowerUrl = url.toLowerCase();

    return videoExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * Check if a URL points to an image file based on file extension
 * @param url - The URL to check
 * @returns true if the URL points to an image file, false otherwise
 */
export const isImageUrl = (url: string): boolean => {
    if (!url) return false;

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();

    return imageExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * Separate media URLs into images and videos
 * @param mediaUrls - Array of media URLs
 * @returns Object containing arrays of image URLs and video URLs
 */
export const separateMediaByType = (mediaUrls: string[]) => {
    const images: string[] = [];
    const videos: string[] = [];

    mediaUrls.forEach(url => {
        if (isVideoUrl(url)) {
            videos.push(url);
        } else if (isImageUrl(url)) {
            images.push(url);
        }
        // Ignore URLs that don't match either type
    });

    return { images, videos };
};