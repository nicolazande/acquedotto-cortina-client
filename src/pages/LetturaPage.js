import React, { useState } from 'react';
import LetturaList from '../components/Lettura/LetturaList';
import '../styles/Lettura/LetturaPage.css';

const LetturaPage = () => {
    const [, setSelectedLetturaId] = useState(null);

    const handleLetturaSelect = (letturaId) => {
        setSelectedLetturaId(letturaId);
    };

    return (
        <div className="lettura-page">
            <LetturaList
                onSelectLettura={handleLetturaSelect}
            />
        </div>
    );
};

export default LetturaPage;
