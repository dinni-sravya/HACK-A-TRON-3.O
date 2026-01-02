import React from "react";
import '../styles/theme.css';

export default function GroupSearch() {
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
			<div className="hp-card" style={{ textAlign: 'center' }}>
				<h1 style={{ color: 'var(--hp-secondary)' }}>Group Search Page</h1>
			</div>
		</div>
	);
}
