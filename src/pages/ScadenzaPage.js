import React, { useState } from 'react';
import ScadenzaList from '../components/Scadenza/ScadenzaList';
import '../styles/Scadenza/ScadenzaPage.css';

const ScadenzaPage = () => {
    const [, setSelectedScadenzaId] = useState(null);

    const handleScadenzaSelect = (scadenzaId) => {
        setSelectedScadenzaId(scadenzaId);
    };

    return (
        <div className="scadenza-page">
            <ScadenzaList
                onSelectScadenza={handleScadenzaSelect}
            />
        </div>
    );
};

export default ScadenzaPage;
