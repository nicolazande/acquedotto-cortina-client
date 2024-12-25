import React, { useState } from 'react';
import ServizioList from '../components/Servizio/ServizioList';
import '../styles/Servizio/ServizioPage.css';

const ServizioPage = () => {
    const [selectedServizioId, setSelectedServizioId] = useState(null);

    const handleServizioSelect = (servizioId) => {
        setSelectedServizioId(servizioId);
    };

    return (
        <div className="servizio-page">
            <ServizioList onSelectServizio={handleServizioSelect} />
        </div>
    );
};

export default ServizioPage;
