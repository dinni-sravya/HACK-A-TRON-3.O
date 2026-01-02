import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPlaces, getCurrentLocation, reverseGeocode } from '../services/mapsService';
import '../styles/theme.css';

const TripDetails = () => {
    const [destination, setDestination] = useState('');
    const [location, setLocation] = useState('');
    const [locationData, setLocationData] = useState(null);
    const [destinationData, setDestinationData] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    // Autocomplete states
    const [locationResults, setLocationResults] = useState([]);
    const [destinationResults, setDestinationResults] = useState([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

    const locationDebounce = useRef(null);
    const destinationDebounce = useRef(null);
    const navigate = useNavigate();

    // Handle location input with debounced search
    const handleLocationInput = async (value) => {
        setLocation(value);
        setLocationData(null);

        if (value.length < 3) {
            setLocationResults([]);
            setShowLocationDropdown(false);
            return;
        }

        clearTimeout(locationDebounce.current);
        locationDebounce.current = setTimeout(async () => {
            const results = await searchPlaces(value);
            setLocationResults(results);
            setShowLocationDropdown(results.length > 0);
        }, 300);
    };

    // Handle destination input with debounced search
    const handleDestinationInput = async (value) => {
        setDestination(value);
        setDestinationData(null);

        if (value.length < 3) {
            setDestinationResults([]);
            setShowDestinationDropdown(false);
            return;
        }

        clearTimeout(destinationDebounce.current);
        destinationDebounce.current = setTimeout(async () => {
            const results = await searchPlaces(value);
            setDestinationResults(results);
            setShowDestinationDropdown(results.length > 0);
        }, 300);
    };

    // Select location from dropdown
    const selectLocation = (place) => {
        setLocation(place.shortName || place.name);
        setLocationData(place);
        setShowLocationDropdown(false);
    };

    // Select destination from dropdown
    const selectDestination = (place) => {
        setDestination(place.shortName || place.name);
        setDestinationData(place);
        setShowDestinationDropdown(false);
    };

    // Get current location using browser geolocation
    const handleGetCurrentLocation = async () => {
        setGettingLocation(true);
        try {
            const coords = await getCurrentLocation();
            setLocationData({ ...coords, name: 'Current Location' });

            // Reverse geocode to get address
            const address = await reverseGeocode(coords.lat, coords.lng);
            setLocation(address.split(',')[0]); // Use first part of address
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Could not get your location. Please enter it manually.');
        } finally {
            setGettingLocation(false);
        }
    };

    const handleFindGroup = (e) => {
        e.preventDefault();
        if (destination && location) {
            // Store trip data in sessionStorage for use in GroupMatch
            const tripData = {
                origin: locationData || { name: location, lat: 28.6139, lng: 77.2090 }, // Default to Delhi
                destination: destinationData || { name: destination, lat: 28.5355, lng: 77.3910 } // Default to Noida
            };
            sessionStorage.setItem('tripData', JSON.stringify(tripData));
            navigate('/group-match');
        } else {
            alert('We need to know where you are going!');
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowLocationDropdown(false);
            setShowDestinationDropdown(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const dropdownStyle = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: 'rgba(30, 30, 50, 0.98)',
        border: '1px solid #444',
        borderRadius: '5px',
        maxHeight: '200px',
        overflowY: 'auto',
        zIndex: 1000,
        marginTop: '2px'
    };

    const dropdownItemStyle = {
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        borderBottom: '1px solid #333',
        fontSize: '0.9rem',
        textAlign: 'left'
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'url("https://images.nightcafe.studio/ik-seo/jobs/NmkSEDEKFgyPZ71Mpp3W/NmkSEDEKFgyPZ71Mpp3W--1--ofy8m/book-of-harry-potter.jpg?tr=w-1600,c-at_max")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div className="hp-card" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--hp-secondary)', marginBottom: '2rem' }}>
                    Plan Your Journey
                </h2>
                <form onSubmit={handleFindGroup}>
                    {/* Location Input */}
                    <div style={{ marginBottom: '1rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Current Location</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="hp-input"
                                placeholder="Start typing your location..."
                                value={location}
                                onChange={(e) => handleLocationInput(e.target.value)}
                                onFocus={() => locationResults.length > 0 && setShowLocationDropdown(true)}
                                style={{ paddingRight: '50px' }}
                            />
                            <button
                                type="button"
                                onClick={handleGetCurrentLocation}
                                disabled={gettingLocation}
                                style={{
                                    position: 'absolute',
                                    right: '5px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    opacity: gettingLocation ? 0.5 : 1
                                }}
                                title="Use my current location"
                            >
                                {gettingLocation ? '⏳' : '📍'}
                            </button>
                        </div>
                        {/* Location Dropdown */}
                        {showLocationDropdown && locationResults.length > 0 && (
                            <div style={dropdownStyle}>
                                {locationResults.map((place, idx) => (
                                    <div
                                        key={place.placeId || idx}
                                        style={{
                                            ...dropdownItemStyle,
                                            background: 'transparent'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(211, 166, 37, 0.2)'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        onClick={() => selectLocation(place)}
                                    >
                                        📍 {place.shortName}
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#888' }}>
                                            {place.name.substring(0, 60)}...
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {locationData && (
                            <p style={{ fontSize: '0.75rem', color: '#4caf50', marginTop: '0.25rem' }}>
                                ✓ Location selected
                            </p>
                        )}
                    </div>

                    {/* Destination Input */}
                    <div style={{ marginBottom: '2rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Destination</label>
                        <input
                            type="text"
                            className="hp-input"
                            placeholder="Where do you want to go?"
                            value={destination}
                            onChange={(e) => handleDestinationInput(e.target.value)}
                            onFocus={() => destinationResults.length > 0 && setShowDestinationDropdown(true)}
                        />
                        {/* Destination Dropdown */}
                        {showDestinationDropdown && destinationResults.length > 0 && (
                            <div style={dropdownStyle}>
                                {destinationResults.map((place, idx) => (
                                    <div
                                        key={place.placeId || idx}
                                        style={{
                                            ...dropdownItemStyle,
                                            background: 'transparent'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(211, 166, 37, 0.2)'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        onClick={() => selectDestination(place)}
                                    >
                                        🎯 {place.shortName}
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#888' }}>
                                            {place.name.substring(0, 60)}...
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {destinationData && (
                            <p style={{ fontSize: '0.75rem', color: '#4caf50', marginTop: '0.25rem' }}>
                                ✓ Destination selected
                            </p>
                        )}
                    </div>

                    <button type="submit" className="hp-btn" style={{ width: '100%' }}>
                        Find Your Magical Group ✨
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TripDetails;
