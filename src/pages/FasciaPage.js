import React, { useState } from 'react';
import FasciaList from '../components/Fascia/FasciaList';
import '../styles/Fascia/FasciaPage.css';

const FasciaPage = () => {
    const [selectedFasciaId, setSelectedFasciaId] = useState(null);

    const handleFasciaSelect = (fasciaId) => {
        setSelectedFasciaId(fasciaId);
    };

    return (
        <div className="fascia-page">
            <FasciaList onSelectFascia={handleFasciaSelect} />
        </div>
    );
};

export default FasciaPage;
