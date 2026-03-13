/**
 * EmailJS utility for sending emails from the frontend (free, no backend SMTP needed).
 *
 * Setup:
 * 1. Go to https://emailjs.com and create a free account
 * 2. Add an email service (Gmail, Outlook, etc.)
 * 3. Create two email templates:
 *    - "password_reset" template with variables: {{to_name}}, {{to_email}}, {{reset_link}}
 *    - "notification" template with variables: {{to_name}}, {{to_email}}, {{subject}}, {{message}}
 * 4. Replace the constants below with your actual IDs
 */

// Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const EMAILJS_RESET_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_RESET_TEMPLATE;
const EMAILJS_NOTIFICATION_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_NOTIFICATION_TEMPLATE;

let emailjsLoaded = false;

async function loadEmailJS() {
    if (emailjsLoaded) return;
    if (typeof window === 'undefined') return;

    try {
        const emailjs = await import('@emailjs/browser');
        emailjs.init(EMAILJS_PUBLIC_KEY);
        emailjsLoaded = true;
    } catch (err) {
        console.warn('EmailJS not loaded:', err.message);
    }
}

export async function sendPasswordResetEmail(toName, toEmail, resetToken) {
    await loadEmailJS();
    const emailjs = await import('@emailjs/browser');

    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_RESET_TEMPLATE, {
        to_name: toName,
        to_email: toEmail,
        reset_link: resetLink,
    });
}

export async function sendNotificationEmail(toName, toEmail, subject, message) {
    await loadEmailJS();
    const emailjs = await import('@emailjs/browser');

    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NOTIFICATION_TEMPLATE, {
        to_name: toName,
        to_email: toEmail,
        subject: subject,
        message: message,
    });
}
