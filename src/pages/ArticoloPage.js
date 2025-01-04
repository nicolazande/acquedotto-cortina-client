import React, { useState } from 'react';
import ArticoloList from '../components/Articolo/ArticoloList';
import '../styles/Articolo/ArticoloPage.css';

const ArticoloPage = () => {
    const [, setSelectedArticoloId] = useState(null);

    const handleArticoloSelect = (articoloId) => {
        setSelectedArticoloId(articoloId);
    };

    return (
        <div className="articolo-page">
            <ArticoloList
                onSelectArticolo={handleArticoloSelect}
            />
        </div>
    );
};

export default ArticoloPage;
