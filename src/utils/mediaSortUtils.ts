import { isVideoUrl } from './mediaUtils';

/**
 * Sort media URLs so that images appear first, followed by videos
 * @param mediaUrls - Array of media URLs
 * @returns Sorted array with images first, then videos
 */
export const sortMediaByType = (mediaUrls: string[]): string[] => {
    return [...mediaUrls].sort((c, d) => {
        const aIsVideo = isVideoUrl(c);
        const bIsVideo = isVideoUrl(d);

        // If both are the same type, maintain original order
        if (aIsVideo === bIsVideo) {
            return 0;
        }

        // Images come first (videos come last)
        return aIsVideo ? 1 : -1;
    });
};

/**
 * Get the first media URL prioritizing images over videos
 * @param mediaObject - Object containing media URLs
 * @returns Array of sorted media URLs with images first
 */
export const getSortedMediaArray = (mediaObject: string | string[] | { [key: string]: string } | undefined): string[] => {
    if (!mediaObject) return [];

    let mediaArray: string[] = [];

    if (typeof mediaObject === 'string') {
        mediaArray = [mediaObject];
    } else if (Array.isArray(mediaObject)) {
        mediaArray = [...mediaObject];
    } else if (typeof mediaObject === 'object') {
        mediaArray = Object.values(mediaObject);
    }

    // Sort to put images first, videos last
    return sortMediaByType(mediaArray);
};