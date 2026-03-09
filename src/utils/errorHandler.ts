/**
 * Utility functions for handling errors in a user-friendly way
 */

// Network error messages
const NETWORK_ERROR_MESSAGES = {
    TIMEOUT: 'Request timed out. Please check your internet connection and try again.',
    OFFLINE: 'You appear to be offline. Please check your internet connection.',
    SERVER_DOWN: 'Our servers are temporarily unavailable. Please try again later.',
    GENERIC_NETWORK: 'Network error occurred. Please check your connection and try again.'
};

// HTTP status code messages
const STATUS_CODE_MESSAGES: Record<number, string> = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Your session has expired. Please log in again.',
    403: 'Access denied. You do not have permission to perform this action.',
    404: 'Requested resource not found.',
    408: NETWORK_ERROR_MESSAGES.TIMEOUT,
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Something went wrong. Please try again.',
    502: 'Bad gateway. Please try again in a few moments.',
    503: 'Service temporarily unavailable. Please try again later.',
    504: NETWORK_ERROR_MESSAGES.TIMEOUT
};

/**
 * Converts backend error responses to user-friendly messages
 * @param error - The error object from axios or fetch
 * @returns A user-friendly error message
 */
export function getFriendlyErrorMessage(error: unknown): string {
    // Type guard to ensure error is an object
    if (!error || typeof error !== 'object') {
        return 'An unexpected error occurred. Please try again.';
    }

    // Handle network errors
    // @ts-expect-error - We're checking for the existence of response property
    if (!error.response) {
        // @ts-expect-error - We're checking for the existence of code property
        if (error.code === 'ECONNABORTED') {
            return NETWORK_ERROR_MESSAGES.TIMEOUT;
        }

        // @ts-expect-error - We're checking for the existence of message property
        if (error.message && typeof error.message === 'string' && error.message.toLowerCase().includes('network')) {
            return NETWORK_ERROR_MESSAGES.GENERIC_NETWORK;
        }

        return NETWORK_ERROR_MESSAGES.GENERIC_NETWORK;
    }

    // Handle HTTP errors
    // @ts-expect-error - We're accessing response property
    const { status, data } = error.response;

    // First, try to get message from backend response
    if (data) {
        // Look for common backend error fields
        const backendMessage = data.message || data.error || data.msg || data.detail;

        if (backendMessage && typeof backendMessage === 'string') {
            // If it's a generic message, we might want to override it
            const lowerMsg = backendMessage.toLowerCase();

            // Override certain generic backend messages
            if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
                return NETWORK_ERROR_MESSAGES.TIMEOUT;
            }

            if (lowerMsg.includes('connection') || lowerMsg.includes('network')) {
                return NETWORK_ERROR_MESSAGES.GENERIC_NETWORK;
            }

            // Filter out specific error patterns you mentioned
            if (lowerMsg.includes('failed') && lowerMsg.includes('try again') ||
                lowerMsg.includes('error 500') ||
                lowerMsg.includes('upload failed') ||
                lowerMsg.includes('update failed')) {
                // Don't show these technical messages, use generic instead
                // Fall through to use status code messages or generic message
            }
            // For security reasons, don't expose detailed backend errors to users
            // unless they're specifically designed for user consumption
            else if (!isTechnicalError(backendMessage)) {
                return backendMessage;
            }
        }
    }

    // Fall back to predefined status code messages
    if (STATUS_CODE_MESSAGES[status]) {
        return STATUS_CODE_MESSAGES[status];
    }

    // Generic fallback
    return `Something went wrong. Please try again.`;
}

/**
 * Determines if an error message is technical in nature and shouldn't be shown to users
 * @param message - The error message to check
 * @returns true if the message appears to be technical
 */
function isTechnicalError(message: string): boolean {
    const technicalTerms = [
        'exception',
        'stack trace',
        'sql',
        'database',
        'connection refused',
        'null pointer',
        'undefined variable',
        'segmentation fault',
        'unhandled promise rejection',
        'traceback',
        'call stack'
    ];

    const lowerMessage = message.toLowerCase();

    // Check for technical terms
    const hasTechnicalTerm = technicalTerms.some(term => lowerMessage.includes(term));

    // Check for specific patterns you want to filter
    const hasFilteredPattern =
        (lowerMessage.includes('failed') && lowerMessage.includes('try again')) ||
        lowerMessage.includes('error 500') ||
        lowerMessage.includes('upload failed') ||
        lowerMessage.includes('update failed');

    return hasTechnicalTerm || hasFilteredPattern;
}

/**
 * Checks if an error is a network connectivity issue
 * @param error - The error object
 * @returns true if it's a network connectivity issue
 */
export function isNetworkError(error: unknown): boolean {
    // Type guard to ensure error is an object
    if (!error || typeof error !== 'object') {
        return false;
    }

    // @ts-expect-error - We're checking for the existence of response property
    if (!error.response) {
        return true;
    }

    // @ts-expect-error - We're accessing response property
    const { status } = error.response;
    return status === 408 || status === 502 || status === 503 || status === 504;
}