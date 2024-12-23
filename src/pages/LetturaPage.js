import React, { useState } from 'react';
import LetturaList from '../components/Lettura/LetturaList';
import '../styles/Lettura/LetturaPage.css';

const LetturaPage = () => {
    const [selectedLetturaId, setSelectedLetturaId] = useState(null);

    const handleLetturaSelect = (letturaId) => {
        setSelectedLetturaId(letturaId);
    };

    const handleLetturaDeselect = () => {
        setSelectedLetturaId(null);
    };

    return (
        <div className="lettura-page">
            <LetturaList
                onSelectLettura={handleLetturaSelect}
                selectedLetturaId={selectedLetturaId}
                onDeselectLettura={handleLetturaDeselect}
            />
        </div>
    );
};

export default LetturaPage;
