import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from './shared/Icon';
import '../styles/Navbar.css';

// Le voci arrivano gia divise per gruppo. Il separatore fra gestione quotidiana
// e tariffe evita che dodici voci allo stesso livello sembrino tutte equivalenti.
// `items` arriva sempre da App, gia filtrato per il ruolo: un valore di
// ripiego qui mostrerebbe tutto il menu a chi non ne ha diritto.
const Navbar = ({ items, onLogout }) => {
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
                        <img src="/icon.ico" alt="" />
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
                {items.map((item, indice) => (
                    <li
                        className={`nav-item${
                            indice > 0 && item.group !== items[indice - 1].group ? ' nav-item-group-start' : ''
                        }`}
                        key={item.path}
                    >
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
