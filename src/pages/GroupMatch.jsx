import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDistance } from '../utils/distanceCalc';
import { getAIFareEstimate, getGroupMatchingSuggestions } from '../services/geminiService';
import '../styles/theme.css';

const GroupMatch = () => {
    const [searching, setSearching] = useState(true);
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tripInfo, setTripInfo] = useState(null);
    const [fareInfo, setFareInfo] = useState(null);
    const [groupInfo, setGroupInfo] = useState(null);
    const navigate = useNavigate();

    const members = 4; // Example members found

    useEffect(() => {
        const loadTripData = async () => {
            // Get trip data from session storage
            const tripDataStr = sessionStorage.getItem('tripData');

            if (tripDataStr) {
                const tripData = JSON.parse(tripDataStr);
                setTripInfo(tripData);

                // Calculate distance and fare if coordinates are available
                if (tripData.origin?.lat && tripData.destination?.lat) {
                    try {
                        // Get distance from Google Maps
                        const distanceResult = await calculateDistance(
                            { lat: tripData.origin.lat, lng: tripData.origin.lng },
                            { lat: tripData.destination.lat, lng: tripData.destination.lng }
                        );

                        // Get AI-powered fare estimate
                        const fare = await getAIFareEstimate(
                            distanceResult.distance.kilometers,
                            distanceResult.duration.minutes,
                            tripData.origin.name,
                            tripData.destination.name
                        );

                        setFareInfo({
                            ...fare,
                            distance: distanceResult.distance,
                            duration: distanceResult.duration
                        });

                        // Get AI group suggestions
                        const groupSuggestions = await getGroupMatchingSuggestions(tripData, members);
                        setGroupInfo(groupSuggestions);

                    } catch (error) {
                        console.error('Error calculating trip info:', error);
                        // Use fallback values
                        setFareInfo({
                            totalFare: 20,
                            baseFare: 2,
                            distanceCharge: 15,
                            timeCharge: 3,
                            magicalNote: 'Your magical journey awaits!'
                        });
                    }
                } else {
                    // Use default values if no coordinates
                    setFareInfo({
                        totalFare: 20,
                        baseFare: 2,
                        distanceCharge: 15,
                        timeCharge: 3,
                        magicalNote: 'Adventure awaits!'
                    });
                }
            }

            // Simulate searching for 2 seconds
            setTimeout(() => {
                setSearching(false);
            }, 2000);
        };

        loadTripData();
    }, []);

    const handleJoin = () => {
        setLoading(true);
        // Simulate join process
        setTimeout(() => {
            setJoined(true);
            setLoading(false);
        }, 1000);
    };

    const handleProceedToPayment = () => {
        // Store fare info for payment page
        sessionStorage.setItem('fareInfo', JSON.stringify({
            totalFare: fareInfo?.totalFare || 20,
            members: members,
            sharePerPerson: (fareInfo?.totalFare || 20) / members,
            groupName: groupInfo?.groupName || 'Travel Group'
        }));
        navigate('/payment');
    };

    const totalAmount = fareInfo?.totalFare || 20;
    const sharePerPerson = Math.round((totalAmount / members) * 100) / 100;

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
            <div className="hp-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                {searching ? (
                    <div>
                        <h2 style={{ color: 'var(--hp-secondary)' }}>Scrying for nearby wizards...</h2>
                        <div className="loader" style={{ margin: '2rem auto', fontSize: '2rem' }}>🔮</div>
                        <p>Searching within 3 kms...</p>
                        {tripInfo && (
                            <p style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '1rem' }}>
                                {tripInfo.origin?.name} → {tripInfo.destination?.name}
                            </p>
                        )}
                    </div>
                ) : !joined ? (
                    <div>
                        <h2 style={{ color: 'var(--hp-secondary)', marginBottom: '1rem' }}>
                            {groupInfo?.groupName || 'Join Your Fellow Wizards'}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            Found a group of {members - 1} wizards heading to the same destination!
                        </p>
                        {groupInfo?.matchQuality && (
                            <p style={{
                                fontSize: '0.85rem',
                                color: groupInfo.matchQuality === 'Excellent' ? '#4caf50' : 'var(--hp-secondary)',
                                marginBottom: '1rem'
                            }}>
                                Match Quality: {groupInfo.matchQuality}
                            </p>
                        )}
                        {fareInfo && (
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '5px',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem'
                            }}>
                                {fareInfo.distance && (
                                    <p>Distance: {fareInfo.distance.text} • {fareInfo.duration?.text}</p>
                                )}
                                <p style={{ color: 'var(--hp-secondary)' }}>
                                    Est. Total: {totalAmount} Galleons
                                </p>
                            </div>
                        )}
                        <button
                            onClick={handleJoin}
                            className="hp-btn"
                            disabled={loading}
                        >
                            {loading ? 'Joining...' : 'Join Group'}
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 style={{ color: '#4caf50', marginBottom: '1rem' }}>Group Joined!</h2>
                        {groupInfo?.travelAdvice && (
                            <p style={{
                                fontStyle: 'italic',
                                color: '#aaa',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                "{groupInfo.travelAdvice}"
                            </p>
                        )}
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '1rem',
                            borderRadius: '5px',
                            marginBottom: '2rem'
                        }}>
                            <p>Total Ride Cost: {totalAmount} Galleons</p>
                            <p>Members: {members}</p>
                            {fareInfo?.magicalNote && (
                                <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.5rem' }}>
                                    ✨ {fareInfo.magicalNote}
                                </p>
                            )}
                            <hr style={{ borderColor: '#555', margin: '1rem 0' }} />
                            <h3 style={{ color: 'var(--hp-secondary)' }}>
                                Your Share: {sharePerPerson} Galleons
                            </h3>
                            {groupInfo?.estimatedSavings && (
                                <p style={{ fontSize: '0.85rem', color: '#4caf50', marginTop: '0.5rem' }}>
                                    You're saving {groupInfo.estimatedSavings} by sharing!
                                </p>
                            )}
                        </div>
                        <button className="hp-btn" onClick={handleProceedToPayment}>
                            Proceed to Payment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupMatch;
