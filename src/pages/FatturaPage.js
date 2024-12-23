import React, { useState } from 'react';
import FatturaList from '../components/Fattura/FatturaList';
import '../styles/Fattura/FatturaPage.css';

const FatturaPage = () => {
    const [selectedFatturaId, setSelectedFatturaId] = useState(null);

    const handleFatturaSelect = (fatturaId) => {
        setSelectedFatturaId(fatturaId);
    };

    return (
        <div className="fattura-page">
            <FatturaList onSelectFattura={handleFatturaSelect} />
        </div>
    );
};

export default FatturaPage;
