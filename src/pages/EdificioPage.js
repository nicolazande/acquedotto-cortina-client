import React, { useState } from 'react';
import EdificioList from '../components/Edificio/EdificioList';
import '../styles/Edificio/EdificioPage.css';

const EdificioPage = () => {
    const [, setSelectedEdificioId] = useState(null);

    const handleEdificioSelect = (edificioId) => {
        setSelectedEdificioId(edificioId);
    };

    return (
        <div className="edificio-page">
            <EdificioList
                onSelectEdificio={handleEdificioSelect}
            />
        </div>
    );
};

export default EdificioPage;
