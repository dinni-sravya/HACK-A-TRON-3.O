// Authentication Service - Firebase Phone OTP
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';

// Store verification ID for OTP confirmation
let confirmationResult = null;
let recaptchaWidgetId = null;

/**
 * Reset the reCAPTCHA verifier safely
 */
const resetRecaptcha = () => {
    if (recaptchaWidgetId !== null && window.grecaptcha) {
        try {
            window.grecaptcha.reset(recaptchaWidgetId);
        } catch (e) {
            console.log('Could not reset reCAPTCHA:', e);
        }
    }
};

/**
 * Initialize invisible reCAPTCHA verifier
 * Required for Firebase Phone Authentication
 * @param {string} buttonId - ID of the button element to attach reCAPTCHA
 */
export const initRecaptcha = (buttonId) => {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
            size: 'invisible',
            callback: () => {
                // reCAPTCHA solved - will proceed with phone auth
                console.log('reCAPTCHA verified');
            },
            'expired-callback': () => {
                // Reset reCAPTCHA if expired
                console.log('reCAPTCHA expired');
                resetRecaptcha();
            }
        });

        // Render the recaptcha and store widget ID
        window.recaptchaVerifier.render().then((widgetId) => {
            recaptchaWidgetId = widgetId;
        }).catch((error) => {
            console.log('reCAPTCHA render error:', error);
        });
    }
    return window.recaptchaVerifier;
};

/**
 * Clear and reinitialize reCAPTCHA
 */
export const clearRecaptcha = () => {
    if (window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier.clear();
        } catch (e) {
            console.log('Could not clear reCAPTCHA:', e);
        }
        window.recaptchaVerifier = null;
        recaptchaWidgetId = null;
    }
};

/**
 * Send OTP to the provided phone number
 * @param {string} phoneNumber - Phone number with country code (e.g., +91XXXXXXXXXX)
 * @returns {Promise<boolean>} - True if OTP sent successfully
 */
export const sendOTP = async (phoneNumber) => {
    try {
        const appVerifier = window.recaptchaVerifier;

        if (!appVerifier) {
            throw new Error('reCAPTCHA not initialized. Call initRecaptcha first.');
        }

        // Format phone number if needed
        const formattedPhone = phoneNumber.startsWith('+')
            ? phoneNumber
            : `+91${phoneNumber}`; // Default to India country code

        confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        console.log('OTP sent successfully to', formattedPhone);
        return true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        // Reset reCAPTCHA on error
        resetRecaptcha();
        throw error;
    }
};

/**
 * Verify the OTP entered by user
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<object>} - User object on success
 */
export const verifyOTP = async (otp) => {
    try {
        if (!confirmationResult) {
            throw new Error('Please request OTP first');
        }

        const result = await confirmationResult.confirm(otp);
        console.log('User signed in successfully:', result.user);
        return result.user;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

/**
 * Sign out the current user
 */
export const logout = async () => {
    try {
        await signOut(auth);
        confirmationResult = null;
        console.log('User signed out');
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

/**
 * Subscribe to auth state changes
 * @param {function} callback - Function to call when auth state changes
 * @returns {function} - Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get current authenticated user
 * @returns {object|null} - Current user or null
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};
