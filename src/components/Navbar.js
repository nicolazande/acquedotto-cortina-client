import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { navigationItems } from '../config/navigation';
import Icon from './shared/Icon';
import '../styles/Navbar.css';

const Navbar = ({ onLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen((open) => !open);
    const closeMenu = () => setMenuOpen(false);
    const handleLogout = () => {
        closeMenu();
        onLogout();
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" onClick={closeMenu}>
                    <span className="navbar-mark" aria-hidden="true">
                        <img src={`${process.env.PUBLIC_URL}/icon.ico`} alt="" />
                    </span>
                    <span>Acquedotto Zuel</span>
                </Link>
            </div>
            <button
                type="button"
                className="menu-toggle"
                onClick={toggleMenu}
                aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
                aria-expanded={menuOpen}
            >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </button>
            <ul className={`navbar-nav ${menuOpen ? 'active' : ''}`}>
                {navigationItems.map((item) => (
                    <li className="nav-item" key={item.path}>
                        <NavLink
                            exact={item.path === '/'}
                            to={item.path}
                            className="nav-link"
                            activeClassName="active"
                            onClick={closeMenu}
                        >
                            <Icon name={item.icon} />
                            {item.label}
                        </NavLink>
                    </li>
                ))}
                <li className="nav-item">
                    <button type="button" className="nav-link btn-logout" onClick={handleLogout}>
                        <Icon name="arrowLeft" />
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
