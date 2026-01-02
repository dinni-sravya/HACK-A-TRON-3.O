import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';

const languages = [
	'English', 'Spanish', 'French', 'German',
	'Hindi', 'Mandarin', 'Japanese', 'Arabic'
];

const LanguageSelect = () => {
	const [selectedLang, setSelectedLang] = useState('');
	const navigate = useNavigate();

	const handleSubmit = () => {
		if (selectedLang) {
			navigate('/trip-details');
		} else {
			alert('Please select a language to cast your spells!');
		}
	};

	return (
		<div style={{
			minHeight: '100vh',
			padding: '2rem',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundImage: 'url("https://static0.srcdn.com/wordpress/wp-content/uploads/2019/08/Hogwarts-School-Harry-Potter.jpeg")',
			backgroundSize: 'contain',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
			backgroundColor: '#1a1a2e'
		}}>
			<div className="hp-card" style={{ width: '100%', maxWidth: '600px' }}>
				<h2 style={{ textAlign: 'center', color: 'var(--hp-secondary)', marginBottom: '2rem' }}>
					Select Your Language
				</h2>

				<div style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '1rem',
					marginBottom: '2rem'
				}}>
					{languages.map((lang) => (
						<div
							key={lang}
							onClick={() => setSelectedLang(lang)}
							style={{
								padding: '1rem',
								border: `1px solid ${selectedLang === lang ? 'var(--hp-secondary)' : '#444'}`,
								borderRadius: '5px',
								background: selectedLang === lang ? 'rgba(211, 166, 37, 0.2)' : 'rgba(255,255,255,0.05)',
								cursor: 'pointer',
								textAlign: 'center',
								transition: 'all 0.2s'
							}}
						>
							{lang}
						</div>
					))}
				</div>

				<div style={{ textAlign: 'center' }}>
					<button onClick={handleSubmit} className="hp-btn">
						Submit
					</button>
					<p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
						Estimated Cost Per Person: <span style={{ color: 'var(--hp-secondary)' }}>5 Galleons</span>
						<br />(To be split among group members)
					</p>
				</div>
			</div>
		</div>
	);
};

export default LanguageSelect;
