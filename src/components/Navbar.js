// client/src/components/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { isAuthenticated, logout } = useAuth();

    // Chiudi il dropdown quando si clicca fuori da esso
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="navbar">
            <div className="dropdown" ref={dropdownRef}>
                <button className="dropbtn" onClick={toggleDropdown}>
                    <div className="menu-icon">&#9776;</div> {/* Unicode per l'icona delle barre */}
                </button>
                {isAuthenticated() && (
                    <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
                        <Link to="/home" className="nav-link" onClick={() => setDropdownOpen(false)}>Home</Link>
                        <Link to="/view-users" className="nav-link" onClick={() => setDropdownOpen(false)}>Utenti</Link>
                        <Link to="/register" className="nav-link" onClick={() => setDropdownOpen(false)}>Registrati</Link>
                        <button className="nav-link logout-button" onClick={logout}>Logout</button>
                    </div>
                )}
            </div>
            <div className="logo-container"> {/* Logo container with transparent box */}
                <img src={`${process.env.PUBLIC_URL}/icon.ico`} alt="Logo" className="navbar-logo" />
            </div>
        </nav>
    );
};

export default Navbar;
