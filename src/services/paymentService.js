// Payment Service - Wrapper for payment processing
import { processPayment as googlePayProcess, isGooglePayAvailable } from './googlePayService';

/**
 * Check if any payment method is available
 */
export const isPaymentAvailable = async () => {
    const googlePayReady = await isGooglePayAvailable();
    return {
        googlePay: googlePayReady,
        anyAvailable: googlePayReady
    };
};

/**
 * Process payment using available method
 * @param {number} amount - Amount to pay
 * @param {string} method - Payment method ('googlepay' or 'mock')
 * @param {object} metadata - Additional payment metadata
 */
export const processPayment = async (amount, method = 'googlepay', metadata = {}) => {
    const { groupName = 'Travel Group', members = 1 } = metadata;
    const description = `${groupName} - Share for ${members} wizards`;

    if (method === 'googlepay') {
        return await googlePayProcess(amount, description);
    }

    // Mock payment for testing/fallback
    return mockPayment(amount, description);
};

/**
 * Mock payment for testing when Google Pay is unavailable
 */
const mockPayment = (amount, description) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transactionId: 'MOCK_' + Date.now(),
                amount: amount,
                description: description,
                timestamp: new Date().toISOString(),
                mock: true
            });
        }, 1500);
    });
};

/**
 * Store payment receipt
 * @param {object} paymentResult - Result from processPayment
 */
export const savePaymentReceipt = (paymentResult) => {
    try {
        const receipts = JSON.parse(localStorage.getItem('paymentReceipts') || '[]');
        receipts.push(paymentResult);
        localStorage.setItem('paymentReceipts', JSON.stringify(receipts));
        return true;
    } catch (error) {
        console.error('Error saving receipt:', error);
        return false;
    }
};

/**
 * Get payment history
 */
export const getPaymentHistory = () => {
    try {
        return JSON.parse(localStorage.getItem('paymentReceipts') || '[]');
    } catch {
        return [];
    }
};
