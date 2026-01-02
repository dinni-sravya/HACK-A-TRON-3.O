// Gemini AI Service for Smart Travel Features
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
let genAI = null;
let model = null;

/**
 * Initialize the Gemini API client
 */
const initGemini = () => {
    if (!genAI) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            console.warn('Gemini API key not found in environment variables');
            return false;
        }

        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
    return true;
};

/**
 * Generate AI-powered fare estimation
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} durationMin - Duration in minutes
 * @param {string} origin - Origin location name
 * @param {string} destination - Destination name
 * @returns {Promise<object>} - Fare estimation with breakdown
 */
export const getAIFareEstimate = async (distanceKm, durationMin, origin, destination) => {
    if (!initGemini()) {
        // Return calculated fallback if Gemini not available
        return calculateFallbackFare(distanceKm, durationMin);
    }

    try {
        const prompt = `
      You are a fare estimation AI for a ride-sharing app with a Harry Potter theme (currency is "Galleons").
      Calculate a reasonable fare for this trip:
      - Distance: ${distanceKm} km
      - Duration: ${durationMin} minutes
      - From: ${origin}
      - To: ${destination}
      
      Respond ONLY with a JSON object (no markdown, no explanation):
      {
        "baseFare": <number>,
        "distanceCharge": <number>,
        "timeCharge": <number>,
        "totalFare": <number>,
        "pricePerKm": <number>,
        "magicalNote": "<short fun Harry Potter themed note about the journey>"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return calculateFallbackFare(distanceKm, durationMin);
    } catch (error) {
        console.error('Error getting AI fare estimate:', error);
        return calculateFallbackFare(distanceKm, durationMin);
    }
};

/**
 * Get AI-powered travel recommendations for a destination
 * @param {string} destination - Destination name
 * @returns {Promise<object>} - Travel recommendations
 */
export const getTravelRecommendations = async (destination) => {
    if (!initGemini()) {
        return getDefaultRecommendations(destination);
    }

    try {
        const prompt = `
      You are a magical travel advisor for a Harry Potter themed travel app.
      Provide brief travel tips for someone traveling to: ${destination}
      
      Respond ONLY with a JSON object (no markdown):
      {
        "title": "<destination name>",
        "magicalFact": "<fun Harry Potter style fact about traveling there>",
        "tips": ["<tip1>", "<tip2>", "<tip3>"],
        "bestTimeToTravel": "<when to visit>",
        "estimatedTravelClass": "<Express/Standard/Economy>"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return getDefaultRecommendations(destination);
    } catch (error) {
        console.error('Error getting travel recommendations:', error);
        return getDefaultRecommendations(destination);
    }
};

/**
 * Get AI suggestions for group matching
 * @param {object} tripData - Trip details including origin, destination
 * @param {number} groupSize - Current group size
 * @returns {Promise<object>} - Group matching suggestions
 */
export const getGroupMatchingSuggestions = async (tripData, groupSize) => {
    if (!initGemini()) {
        return getDefaultGroupSuggestions(groupSize);
    }

    try {
        const prompt = `
      You are a magical group matching advisor for a Harry Potter themed ride-sharing app.
      A wizard is looking for travel companions:
      - From: ${tripData.origin?.name || 'Unknown'}
      - To: ${tripData.destination?.name || 'Unknown'}
      - Current group size: ${groupSize}
      
      Respond ONLY with a JSON object (no markdown):
      {
        "groupName": "<creative Harry Potter themed group name>",
        "matchQuality": "<Excellent/Good/Fair>",
        "wizardTypes": ["<type1>", "<type2>"],
        "sharedInterests": ["<interest1>", "<interest2>"],
        "travelAdvice": "<short magical travel advice for the group>",
        "estimatedSavings": "<percentage saved by sharing>"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return getDefaultGroupSuggestions(groupSize);
    } catch (error) {
        console.error('Error getting group suggestions:', error);
        return getDefaultGroupSuggestions(groupSize);
    }
};

/**
 * Chat with AI for travel assistance
 * @param {string} message - User message
 * @returns {Promise<string>} - AI response
 */
export const chatWithTravelAI = async (message) => {
    if (!initGemini()) {
        return "The magical oracle is currently unavailable. Please try again later!";
    }

    try {
        const prompt = `
      You are a friendly magical travel assistant named "Portkey Guide" for a Harry Potter themed ride-sharing app called "Magical Miles".
      Respond to this user query in a fun, helpful, and magical way (keep it brief, max 2-3 sentences):
      
      User: ${message}
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error chatting with AI:', error);
        return "Merlin's beard! Something went wrong. Please try again!";
    }
};

// Fallback functions when Gemini is not available
const calculateFallbackFare = (distanceKm, durationMin) => {
    const baseFare = 2;
    const distanceCharge = distanceKm * 1.5;
    const timeCharge = durationMin * 0.3;
    const totalFare = baseFare + distanceCharge + timeCharge;

    return {
        baseFare,
        distanceCharge: Math.round(distanceCharge * 100) / 100,
        timeCharge: Math.round(timeCharge * 100) / 100,
        totalFare: Math.round(totalFare * 100) / 100,
        pricePerKm: 1.5,
        magicalNote: "Your portkey to adventure awaits!"
    };
};

const getDefaultRecommendations = (destination) => ({
    title: destination,
    magicalFact: "Every journey is a step towards adventure!",
    tips: ["Travel light", "Stay alert", "Enjoy the ride"],
    bestTimeToTravel: "Anytime is magical",
    estimatedTravelClass: "Standard"
});

const getDefaultGroupSuggestions = (groupSize) => ({
    groupName: "The Fellowship of Travelers",
    matchQuality: "Good",
    wizardTypes: ["Adventurer", "Explorer"],
    sharedInterests: ["Travel", "New experiences"],
    travelAdvice: "Together we journey, together we save!",
    estimatedSavings: `${Math.round((1 - 1 / groupSize) * 100)}%`
});
