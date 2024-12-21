import React, { useState } from 'react';
import EdificioList from '../components/Edificio/EdificioList';
import '../styles/Edificio/EdificioPage.css';

const EdificioPage = () => {
    const [selectedEdificioId, setSelectedEdificioId] = useState(null);

    const handleEdificioSelect = (edificioId) => {
        setSelectedEdificioId(edificioId);
    };

    const handleEdificioDeselect = () => {
        setSelectedEdificioId(null);
    };

    return (
        <div className="edificio-page">
            <EdificioList
                onSelectEdificio={handleEdificioSelect}
                selectedEdificioId={selectedEdificioId}
                onDeselectEdificio={handleEdificioDeselect}
            />
        </div>
    );
};

export default EdificioPage;
