import React, { useState } from 'react';
import FatturaList from '../components/Fattura/FatturaList';
import '../styles/Fattura/FatturaPage.css';

const FatturaPage = () => {
    const [, setSelectedFatturaId] = useState(null);

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
