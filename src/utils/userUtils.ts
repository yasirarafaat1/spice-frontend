/**
 * Extract username from email address
 * @param email - The email address
 * @returns The username part (before @)
 */
export function getUsernameFromEmail(email: string | undefined): string {
    if (!email) return 'User';

    // Split the email at the '@' symbol and take the first part
    const username = email.split('@')[0];

    // If splitting didn't work, return a default
    return username || 'User';
}