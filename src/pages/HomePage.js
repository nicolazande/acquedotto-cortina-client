import React from 'react';
import { Link } from 'react-router-dom';
import { primaryNavigationItems } from '../config/navigation';
import '../styles/HomePage.css';
import ServerStatusIndicator from '../ServerStatusIndicator';

const featuredPaths = ['/clienti', '/contatori', '/edifici', '/letture', '/fatture', '/scadenze'];
const archivePaths = ['/servizi', '/articoli', '/listini', '/fasce'];

const getInitials = (label) => label.slice(0, 2).toUpperCase();

const renderHomeCard = (item) => (
    <Link className="home-card" to={item.path} key={item.path}>
        <span className="home-card-mark">{getInitials(item.label)}</span>
        <span className="home-card-action" aria-hidden="true">Apri</span>
        <span className="home-card-copy">
            <strong>{item.label}</strong>
            <span>{item.description}</span>
        </span>
    </Link>
);

const HomePage = () => {
    const featuredItems = primaryNavigationItems.filter((item) => featuredPaths.includes(item.path));
    const archiveItems = primaryNavigationItems.filter((item) => archivePaths.includes(item.path));

    return (
        <div className="homepage">
            <section className="home-hero" aria-labelledby="home-title">
                <div>
                    <span className="eyebrow">Acquedotto Zuel</span>
                    <h1 id="home-title">Panoramica</h1>
                </div>
                <ServerStatusIndicator />
            </section>

            <section className="home-grid home-grid-primary" aria-label="Aree principali">
                {featuredItems.map(renderHomeCard)}
            </section>

            <section className="home-panel" aria-label="Archivi e tariffe">
                <div className="home-panel-heading">
                    <h2>Archivi e tariffe</h2>
                </div>
                <div className="home-grid home-grid-compact">
                    {archiveItems.map(renderHomeCard)}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
