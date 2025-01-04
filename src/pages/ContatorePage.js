import React, { useState } from 'react';
import ContatoreList from '../components/Contatore/ContatoreList';
import '../styles/Contatore/ContatorePage.css';

const ContatorePage = () => {
    const [, setSelectedContatoreId] = useState(null);

    const handleContatoreSelect = (contatoreId) => {
        setSelectedContatoreId(contatoreId);
    };

    return (
        <div className="contatore-page">
            <ContatoreList
                onSelectContatore={handleContatoreSelect}
            />
        </div>
    );
};

export default ContatorePage;
