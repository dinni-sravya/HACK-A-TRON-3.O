// OpenStreetMap Services (Free, No API Key Required)
// Uses Nominatim for geocoding and OSRM for routing

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const OSRM_BASE_URL = 'https://router.project-osrm.org';

/**
 * Search for places using Nominatim (OpenStreetMap geocoding)
 * @param {string} query - Search query
 * @returns {Promise<array>} - Array of place results
 */
export const searchPlaces = async (query) => {
    try {
        const response = await fetch(
            `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'MagicalMiles-HackathonApp/1.0'
                }
            }
        );

        const data = await response.json();

        return data.map(place => ({
            name: place.display_name,
            shortName: place.name || place.display_name.split(',')[0],
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            placeId: place.place_id,
            type: place.type,
            address: place.address
        }));
    } catch (error) {
        console.error('Error searching places:', error);
        return [];
    }
};

/**
 * Initialize autocomplete functionality on an input element
 * @param {HTMLInputElement} inputElement - The input element
 * @param {function} onSelect - Callback when place is selected
 * @param {function} onResults - Callback to show results dropdown
 */
export const initPlacesAutocomplete = (inputElement, onSelect, onResults) => {
    let debounceTimer = null;

    const handleInput = async (e) => {
        const query = e.target.value;

        if (query.length < 3) {
            if (onResults) onResults([]);
            return;
        }

        // Debounce search requests
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const results = await searchPlaces(query);
            if (onResults) onResults(results);
        }, 300);
    };

    inputElement.addEventListener('input', handleInput);

    // Return cleanup function
    return () => {
        inputElement.removeEventListener('input', handleInput);
        clearTimeout(debounceTimer);
    };
};

/**
 * Calculate distance and duration between two points using OSRM
 * @param {object} origin - Origin coordinates { lat, lng }
 * @param {object} destination - Destination coordinates { lat, lng }
 * @returns {Promise<object>} - Distance and duration info
 */
export const calculateDistance = async (origin, destination) => {
    try {
        // OSRM expects coordinates as lng,lat
        const url = `${OSRM_BASE_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            throw new Error('Route not found');
        }

        const route = data.routes[0];
        const distanceMeters = route.distance;
        const durationSeconds = route.duration;

        return {
            distance: {
                text: distanceMeters >= 1000
                    ? `${(distanceMeters / 1000).toFixed(1)} km`
                    : `${Math.round(distanceMeters)} m`,
                meters: distanceMeters,
                kilometers: distanceMeters / 1000
            },
            duration: {
                text: durationSeconds >= 3600
                    ? `${Math.floor(durationSeconds / 3600)}h ${Math.round((durationSeconds % 3600) / 60)}min`
                    : `${Math.round(durationSeconds / 60)} min`,
                seconds: durationSeconds,
                minutes: Math.round(durationSeconds / 60)
            }
        };
    } catch (error) {
        console.error('Error calculating distance:', error);
        // Return fallback using Haversine
        const km = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
        return {
            distance: {
                text: `${km.toFixed(1)} km`,
                meters: km * 1000,
                kilometers: km
            },
            duration: {
                text: `${Math.round(km * 2)} min`, // Rough estimate: 30km/h average
                seconds: km * 120,
                minutes: Math.round(km * 2)
            }
        };
    }
};

/**
 * Get user's current location using browser Geolocation API
 * @returns {Promise<object>} - User's coordinates { lat, lng }
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                reject(new Error(`Geolocation error: ${error.message}`));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    });
};

/**
 * Reverse geocode coordinates to get address using Nominatim
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - Formatted address
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'MagicalMiles-HackathonApp/1.0'
                }
            }
        );

        const data = await response.json();
        return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
};

/**
 * Haversine formula for calculating distance between two coordinates
 * Used as fallback when OSRM is unavailable
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Legacy function for compatibility - no longer needed for OSM
 */
export const loadGoogleMapsAPI = () => {
    console.log('Using OpenStreetMap - no API key required!');
    return Promise.resolve(true);
};
