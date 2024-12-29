import React, { useState } from 'react';
import ScadenzaList from '../components/Scadenza/ScadenzaList';
import '../styles/Scadenza/ScadenzaPage.css';

const ScadenzaPage = () => {
    const [selectedScadenzaId, setSelectedScadenzaId] = useState(null);

    const handleScadenzaSelect = (scadenzaId) => {
        setSelectedScadenzaId(scadenzaId);
    };

    const handleScadenzaDeselect = () => {
        setSelectedScadenzaId(null);
    };

    return (
        <div className="scadenza-page">
            <ScadenzaList
                onSelectScadenza={handleScadenzaSelect}
                selectedScadenzaId={selectedScadenzaId}
                onDeselectScadenza={handleScadenzaDeselect}
            />
        </div>
    );
};

export default ScadenzaPage;
