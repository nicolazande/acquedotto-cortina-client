import React, { useState } from 'react';
import ContatoreList from '../components/Contatore/ContatoreList';
import '../styles/Contatore/ContatorePage.css';

const ContatorePage = () => {
    const [selectedContatoreId, setSelectedContatoreId] = useState(null);

    const handleContatoreSelect = (contatoreId) => {
        setSelectedContatoreId(contatoreId);
    };

    const handleContatoreDeselect = () => {
        setSelectedContatoreId(null);
    };

    return (
        <div className="contatore-page">
            <ContatoreList
                onSelectContatore={handleContatoreSelect}
                selectedContatoreId={selectedContatoreId}
                onDeselectContatore={handleContatoreDeselect}
            />
        </div>
    );
};

export default ContatorePage;
