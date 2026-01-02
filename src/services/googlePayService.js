// Google Pay API Service
// Handles payment initialization and processing

// Store the Google Pay client
let paymentsClient = null;

// Google Pay API configuration
const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};

// Card networks accepted
const allowedCardNetworks = ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER'];

// Auth methods supported
const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

// Tokenization specification for payment gateway
const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        gateway: 'example', // Replace with actual gateway (stripe, braintree, etc.)
        gatewayMerchantId: 'exampleGatewayMerchantId'
    }
};

// Base card payment method
const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks
    }
};

// Card payment method with tokenization
const cardPaymentMethod = {
    ...baseCardPaymentMethod,
    tokenizationSpecification: tokenizationSpecification
};

/**
 * Load Google Pay API script dynamically
 */
const loadGooglePayScript = () => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.payments) {
            resolve(window.google);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.async = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => reject(new Error('Failed to load Google Pay API'));
        document.head.appendChild(script);
    });
};

/**
 * Get the Google Pay environment (TEST or PRODUCTION)
 */
const getEnvironment = () => {
    return import.meta.env.VITE_GOOGLE_PAY_ENVIRONMENT || 'TEST';
};

/**
 * Initialize Google Pay client
 */
export const initGooglePay = async () => {
    try {
        await loadGooglePayScript();

        paymentsClient = new window.google.payments.api.PaymentsClient({
            environment: getEnvironment()
        });

        return true;
    } catch (error) {
        console.error('Failed to initialize Google Pay:', error);
        return false;
    }
};

/**
 * Check if Google Pay is available
 */
export const isGooglePayAvailable = async () => {
    if (!paymentsClient) {
        const initialized = await initGooglePay();
        if (!initialized) return false;
    }

    try {
        const isReadyToPayRequest = {
            ...baseRequest,
            allowedPaymentMethods: [baseCardPaymentMethod]
        };

        const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
        return response.result;
    } catch (error) {
        console.error('Error checking Google Pay availability:', error);
        return false;
    }
};

/**
 * Create payment request
 * @param {number} amount - Payment amount
 * @param {string} currencyCode - Currency code (default: INR)
 * @param {string} countryCode - Country code (default: IN)
 */
const getPaymentDataRequest = (amount, currencyCode = 'INR', countryCode = 'IN') => {
    const merchantId = import.meta.env.VITE_GOOGLE_PAY_MERCHANT_ID || 'TEST_MERCHANT_ID';

    return {
        ...baseRequest,
        allowedPaymentMethods: [cardPaymentMethod],
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: amount.toString(),
            currencyCode: currencyCode,
            countryCode: countryCode
        },
        merchantInfo: {
            merchantId: merchantId,
            merchantName: 'Magical Miles - PortKey Pool'
        }
    };
};

/**
 * Process payment with Google Pay
 * @param {number} amount - Amount to charge
 * @param {string} description - Payment description
 * @returns {Promise<object>} - Payment result
 */
export const processPayment = async (amount, description = 'Ride Share Payment') => {
    if (!paymentsClient) {
        const initialized = await initGooglePay();
        if (!initialized) {
            throw new Error('Google Pay is not available');
        }
    }

    try {
        const paymentDataRequest = getPaymentDataRequest(amount);
        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

        // Payment successful - paymentData contains the payment token
        console.log('Payment successful:', paymentData);

        return {
            success: true,
            paymentData: paymentData,
            transactionId: generateTransactionId(),
            amount: amount,
            description: description,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        if (error.statusCode === 'CANCELED') {
            return {
                success: false,
                error: 'Payment cancelled by user',
                cancelled: true
            };
        }

        console.error('Payment error:', error);
        return {
            success: false,
            error: error.message || 'Payment failed'
        };
    }
};

/**
 * Create a Google Pay button
 * @param {function} onClick - Click handler
 * @returns {HTMLElement|null} - Google Pay button element
 */
export const createGooglePayButton = async (onClick) => {
    if (!paymentsClient) {
        const initialized = await initGooglePay();
        if (!initialized) return null;
    }

    try {
        const button = paymentsClient.createButton({
            onClick: onClick,
            buttonColor: 'black',
            buttonType: 'pay',
            buttonRadius: 4,
            buttonSizeMode: 'fill'
        });

        return button;
    } catch (error) {
        console.error('Error creating Google Pay button:', error);
        return null;
    }
};

/**
 * Generate a unique transaction ID
 */
const generateTransactionId = () => {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};
