import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { isGooglePayAvailable, createGooglePayButton } from '../services/googlePayService';
import { processPayment, savePaymentReceipt } from '../services/paymentService';
import '../styles/theme.css';

export default function Payment() {
	const [fareInfo, setFareInfo] = useState(null);
	const [googlePayReady, setGooglePayReady] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [paymentComplete, setPaymentComplete] = useState(false);
	const [paymentResult, setPaymentResult] = useState(null);
	const [error, setError] = useState('');
	const googlePayButtonRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		// Get fare info from session storage
		const fareInfoStr = sessionStorage.getItem('fareInfo');
		if (fareInfoStr) {
			setFareInfo(JSON.parse(fareInfoStr));
		} else {
			// Default values if no fare info
			setFareInfo({
				totalFare: 20,
				members: 4,
				sharePerPerson: 5,
				groupName: 'Travel Group'
			});
		}

		// Check Google Pay availability and create button
		const initGooglePay = async () => {
			const available = await isGooglePayAvailable();
			setGooglePayReady(available);

			if (available && googlePayButtonRef.current) {
				const button = await createGooglePayButton(handleGooglePayClick);
				if (button && googlePayButtonRef.current) {
					googlePayButtonRef.current.innerHTML = '';
					googlePayButtonRef.current.appendChild(button);
				}
			}
		};

		initGooglePay();
	}, []);

	const handleGooglePayClick = async () => {
		await handlePayment('googlepay');
	};

	const handlePayment = async (method) => {
		setError('');
		setProcessing(true);

		try {
			const amount = fareInfo?.sharePerPerson || 5;
			const result = await processPayment(amount, method, {
				groupName: fareInfo?.groupName,
				members: fareInfo?.members
			});

			if (result.success) {
				setPaymentResult(result);
				setPaymentComplete(true);
				savePaymentReceipt(result);
			} else if (result.cancelled) {
				setError('Payment was cancelled');
			} else {
				setError(result.error || 'Payment failed. Please try again.');
			}
		} catch (err) {
			setError(err.message || 'Something went wrong');
		} finally {
			setProcessing(false);
		}
	};

	const handleMockPayment = () => {
		handlePayment('mock');
	};

	if (paymentComplete) {
		return (
			<div style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundImage: 'url("https://images.nightcafe.studio/ik-seo/jobs/NmkSEDEKFgyPZ71Mpp3W/NmkSEDEKFgyPZ71Mpp3W--1--ofy8m/book-of-harry-potter.jpg?tr=w-1600,c-at_max")',
				backgroundSize: 'cover',
				backgroundPosition: 'center'
			}}>
				<div className="hp-card" style={{ textAlign: 'center', maxWidth: '450px' }}>
					<div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
					<h1 style={{ color: '#4caf50', marginBottom: '1rem' }}>Payment Successful!</h1>
					<p style={{ marginBottom: '1.5rem' }}>Your Gringotts transaction is complete.</p>

					<div style={{
						background: 'rgba(255,255,255,0.1)',
						padding: '1.5rem',
						borderRadius: '8px',
						marginBottom: '2rem',
						textAlign: 'left'
					}}>
						<p><strong>Amount Paid:</strong> {fareInfo?.sharePerPerson} Galleons</p>
						<p><strong>Group:</strong> {fareInfo?.groupName}</p>
						<p><strong>Transaction ID:</strong> <span style={{ fontSize: '0.85rem', color: '#aaa' }}>{paymentResult?.transactionId}</span></p>
						{paymentResult?.mock && (
							<p style={{ color: 'var(--hp-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
								* This was a test payment
							</p>
						)}
					</div>

					<button
						className="hp-btn"
						onClick={() => navigate('/trip-details')}
						style={{ width: '100%' }}
					>
						Book Another Journey
					</button>
				</div>
			</div>
		);
	}

	return (
		<div style={{
			minHeight: '100vh',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundImage: 'url("https://images.nightcafe.studio/ik-seo/jobs/NmkSEDEKFgyPZ71Mpp3W/NmkSEDEKFgyPZ71Mpp3W--1--ofy8m/book-of-harry-potter.jpg?tr=w-1600,c-at_max")',
			backgroundSize: 'cover',
			backgroundPosition: 'center'
		}}>
			<div className="hp-card" style={{ textAlign: 'center', maxWidth: '450px' }}>
				<h1 style={{ color: 'var(--hp-secondary)', marginBottom: '0.5rem' }}>Gringotts Payment</h1>
				<p style={{ color: '#aaa', marginBottom: '2rem' }}>Secure wizarding payment portal</p>

				{fareInfo && (
					<div style={{
						background: 'rgba(255,255,255,0.1)',
						padding: '1.5rem',
						borderRadius: '8px',
						marginBottom: '2rem'
					}}>
						<p style={{ marginBottom: '0.5rem' }}>
							<strong>{fareInfo.groupName}</strong>
						</p>
						<p style={{ color: '#aaa', fontSize: '0.9rem' }}>
							Total: {fareInfo.totalFare} Galleons ÷ {fareInfo.members} wizards
						</p>
						<hr style={{ border: 'none', borderTop: '1px solid #444', margin: '1rem 0' }} />
						<h2 style={{ color: 'var(--hp-secondary)', margin: 0 }}>
							Your Share: {fareInfo.sharePerPerson} Galleons
						</h2>
					</div>
				)}

				{error && (
					<p style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.9rem' }}>
						{error}
					</p>
				)}

				{processing ? (
					<div style={{ padding: '2rem' }}>
						<div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔮</div>
						<p>Processing your magical payment...</p>
					</div>
				) : (
					<div>
						{/* Google Pay Button Container */}
						{googlePayReady && (
							<div
								ref={googlePayButtonRef}
								style={{
									marginBottom: '1rem',
									minHeight: '48px'
								}}
							/>
						)}

						{/* Fallback/Alternative Payment Button */}
						<button
							className="hp-btn"
							onClick={handleMockPayment}
							style={{
								width: '100%',
								marginTop: googlePayReady ? '0.5rem' : 0
							}}
						>
							{googlePayReady ? 'Pay with Wizard Gold' : 'Complete Payment'}
						</button>

						<p style={{
							marginTop: '1.5rem',
							fontSize: '0.8rem',
							color: '#888'
						}}>
							🔒 Your payment is secured by Gringotts Bank
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
