import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';

// Note: For production, uncomment Firebase imports and use real OTP
// import { initRecaptcha, sendOTP, verifyOTP, clearRecaptcha } from '../services/authService';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Demo OTP for hackathon (any 6 digits work)
  const DEMO_MODE = true;

  const handleSendOTP = async () => {
    setError('');
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    if (DEMO_MODE) {
      // Simulate OTP sending for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      setLoading(false);
      return;
    }

    // Production code with Firebase (currently disabled)
    // try {
    //   if (!window.recaptchaVerifier) {
    //     initRecaptcha('login-button');
    //   }
    //   await sendOTP(phone);
    //   setOtpSent(true);
    // } catch (err) {
    //   setError(err.message || 'Failed to send OTP');
    // }

    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    if (DEMO_MODE) {
      // Accept any 6-digit OTP for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      // Store demo user in session
      sessionStorage.setItem('user', JSON.stringify({ phone, isDemo: true }));
      navigate('/language');
      return;
    }

    // Production code with Firebase
    // try {
    //   await verifyOTP(otp);
    //   navigate('/language');
    // } catch (err) {
    //   setError(err.message || 'Invalid OTP');
    // }

    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOTP();
    } else {
      handleVerifyOTP();
    }
  };

  // Quick demo skip
  const handleDemoLogin = () => {
    sessionStorage.setItem('user', JSON.stringify({ phone: 'demo', isDemo: true }));
    navigate('/language');
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundImage: 'url("https://images.nightcafe.studio/ik-seo/jobs/NmkSEDEKFgyPZ71Mpp3W/NmkSEDEKFgyPZ71Mpp3W--1--ofy8m/book-of-harry-potter.jpg?tr=w-1600,c-at_max")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="hp-card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--hp-secondary)', marginBottom: '2rem' }}>Magical Miles</h1>
        <form onSubmit={handleLogin}>
          <input
            type="tel"
            placeholder="Owl Number (Phone)"
            className="hp-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={otpSent || loading}
          />
          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Secret Spell (OTP)"
                className="hp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                disabled={loading}
              />
              <p style={{ fontSize: '0.8rem', color: '#4caf50', marginBottom: '0.5rem' }}>
                ✓ OTP sent! Enter any 6 digits for demo
              </p>
            </>
          )}
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            id="login-button"
            className="hp-btn"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Casting Spell...' : otpSent ? 'Sign In' : 'Send OTP'}
          </button>
          {otpSent && (
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
              style={{
                marginTop: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--hp-secondary)',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Change Phone Number
            </button>
          )}
        </form>

        {/* Quick Demo Skip */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #444' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            style={{
              background: 'transparent',
              border: '1px solid var(--hp-secondary)',
              color: 'var(--hp-secondary)',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ✨ Quick Demo
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#ccc' }}>
          <p>By signing in, you agree to our <br /> <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Magical Terms & Conditions</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
