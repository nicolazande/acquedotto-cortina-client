import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ onLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Acquedotto Zuel</Link>
            </div>
            <div className="menu-toggle" onClick={toggleMenu}>
                &#9776;
            </div>
            <ul className={`navbar-nav ${menuOpen ? 'active' : ''}`}>
                <li className="nav-item">
                    <Link to="/" className="nav-link" onClick={toggleMenu}>Home</Link>
                </li>
                <li className="nav-item">
                    <Link to="/auth/profile" className="nav-link" onClick={toggleMenu}>Admin</Link>
                </li>
                <li className="nav-item">
                    <Link to="/clienti" className="nav-link" onClick={toggleMenu}>Clienti</Link>
                </li>
                <li className="nav-item">
                    <Link to="/contatori" className="nav-link" onClick={toggleMenu}>Contatori</Link>
                </li>
                <li className="nav-item">
                    <Link to="/edifici" className="nav-link" onClick={toggleMenu}>Edifici</Link>
                </li>
                <li className="nav-item">
                    <Link to="/letture" className="nav-link" onClick={toggleMenu}>Letture</Link>
                </li>
                <li className="nav-item">
                    <Link to="/fatture" className="nav-link" onClick={toggleMenu}>Fatture</Link>
                </li>
                <li className="nav-item">
                    <Link to="/servizi" className="nav-link" onClick={toggleMenu}>Servizi</Link>
                </li>
                <li className="nav-item">
                    <Link to="/articoli" className="nav-link" onClick={toggleMenu}>Articoli</Link>
                </li>
                <li className="nav-item">
                    <Link to="/listini" className="nav-link" onClick={toggleMenu}>Listini</Link>
                </li>
                <li className="nav-item">
                    <Link to="/fasce" className="nav-link" onClick={toggleMenu}>Fasce</Link>
                </li>
                <li className="nav-item">
                    <Link to="/scadenze" className="nav-link" onClick={toggleMenu}>Scadenze</Link>
                </li>
                <li className="nav-item">
                    <button className="nav-link btn-logout" onClick={() => { toggleMenu(); onLogout(); }}>
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
