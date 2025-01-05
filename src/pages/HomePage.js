import React from 'react';
import '../styles/HomePage.css';
import ServerStatusIndicator from '../ServerStatusIndicator';

const HomePage = () => {
    return (
        <div className="homepage">
            <ServerStatusIndicator />
            <h1>Acquedotto Zuel</h1>
            <p>.</p>
        </div>
    );
};

export default HomePage;
