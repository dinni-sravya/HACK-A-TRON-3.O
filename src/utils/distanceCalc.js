// Distance Calculator Utility using Google Maps Distance Matrix API
import { calculateDistance as mapsCalculateDistance } from '../services/mapsService';

/**
 * Calculate distance between two locations
 * @param {object} origin - Origin location { lat, lng }
 * @param {object} destination - Destination location { lat, lng }
 * @returns {Promise<object>} - Distance and duration info
 */
export const calculateDistance = async (origin, destination) => {
    try {
        const result = await mapsCalculateDistance(origin, destination);
        return result;
    } catch (error) {
        console.error('Error calculating distance:', error);
        // Return fallback values if API fails
        return {
            distance: {
                text: 'Unknown',
                meters: 0,
                kilometers: 0
            },
            duration: {
                text: 'Unknown',
                seconds: 0,
                minutes: 0
            }
        };
    }
};

/**
 * Estimate fare based on distance and duration
 * Base fare + per km rate + per minute rate
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} durationMin - Duration in minutes
 * @returns {object} - Fare breakdown
 */
export const estimateFare = (distanceKm, durationMin) => {
    // Fare structure (in Galleons for Harry Potter theme)
    const baseFare = 2; // Base fare
    const perKmRate = 1.5; // Per kilometer
    const perMinRate = 0.5; // Per minute

    const distanceCharge = distanceKm * perKmRate;
    const timeCharge = durationMin * perMinRate;
    const totalFare = baseFare + distanceCharge + timeCharge;

    return {
        baseFare,
        distanceCharge: Math.round(distanceCharge * 100) / 100,
        timeCharge: Math.round(timeCharge * 100) / 100,
        totalFare: Math.round(totalFare * 100) / 100
    };
};

/**
 * Calculate fare share per person
 * @param {number} totalFare - Total trip fare
 * @param {number} members - Number of group members
 * @returns {number} - Fare per person
 */
export const calculateFareShare = (totalFare, members) => {
    if (members <= 0) return totalFare;
    return Math.round((totalFare / members) * 100) / 100;
};

/**
 * Haversine formula for calculating distance between two coordinates
 * Used as fallback when Google Maps API is unavailable
 * @param {number} lat1 - Origin latitude
 * @param {number} lon1 - Origin longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lon2 - Destination longitude
 * @returns {number} - Distance in kilometers
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);
