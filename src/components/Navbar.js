import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'

const Navbar = () => 
{
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Acquedotto Zuel</Link>
            </div>
            <ul className="navbar-nav">
                <li className="nav-item">
                    <Link to="/" className="nav-link">Home</Link>
                </li>
                <li className="nav-item">
                    <Link to="/clienti" className="nav-link">Clienti</Link>
                </li>
                <li className="nav-item">
                    <Link to="/contatori" className="nav-link">Contatori</Link>
                </li>
                <li className="nav-item">
                    <Link to="/edifici" className="nav-link">Edifici</Link>
                </li>
                <li className="nav-item">
                    <Link to="/letture" className="nav-link">Letture</Link>
                </li>
                <li className="nav-item">
                    <Link to="/fatture" className="nav-link">Fatture</Link>
                </li>
                <li className="nav-item">
                    <Link to="/servizi" className="nav-link">Servizi</Link>
                </li>
                <li className="nav-item">
                    <Link to="/articoli" className="nav-link">Articoli</Link>
                </li>
                <li className="nav-item">
                    <Link to="/listini" className="nav-link">Listini</Link>
                </li>
                <li className="nav-item">
                    <Link to="/fasce" className="nav-link">Fasce</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
