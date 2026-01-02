import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LanguageSelect from './pages/LanguageSelect';
import TripDetails from './pages/TripDetails';
import GroupMatch from './pages/GroupMatch';
import Payment from './pages/Payment';
import './styles/theme.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/language" element={<LanguageSelect />} />
        <Route path="/trip-details" element={<TripDetails />} />
        <Route path="/group-match" element={<GroupMatch />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  );
}

export default App;

