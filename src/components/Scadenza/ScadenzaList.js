import React, { useEffect, useState } from 'react';
import scadenzaApi from '../../api/scadenzaApi';
import ScadenzaDetails from './ScadenzaDetails';
import '../../styles/Scadenza/ScadenzaList.css';

const ScadenzaList = ({ onSelectScadenza, selectedScadenzaId, onDeselectScadenza }) => {
    const [scadenze, setScadenze] = useState([]);

    useEffect(() => {
        const fetchScadenze = async () => {
            try {
                const response = await scadenzaApi.getScadenze();
                setScadenze(response.data);
            } catch (error) {
                alert('Errore durante il recupero delle scadenze');
                console.error(error);
            }
        };

        fetchScadenze();
    }, []);

    const handleDelete = async (id) => {
        try {
            await scadenzaApi.deleteScadenza(id);
            setScadenze(scadenze.filter(scadenza => scadenza._id !== id));
            if (selectedScadenzaId === id) {
                onDeselectScadenza();
            }
        } catch (error) {
            alert('Errore durante la cancellazione della scadenza');
            console.error(error);
        }
    };

    return (
        <div className="scadenza-list-container">
            <div className="scadenza-list">
                <h2>Lista Scadenze</h2>
                <ul>
                    {scadenze.map((scadenza) => (
                        <li key={scadenza._id} className="scadenza-list-item">
                            <span>{new Date(scadenza.dataScadenza).toLocaleDateString()} - €{scadenza.importo}</span>
                            <button onClick={() => onSelectScadenza(scadenza._id)} className="btn btn-details">Dettagli</button>
                            <button onClick={() => handleDelete(scadenza._id)} className="btn btn-delete">Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedScadenzaId && (
                <div className="scadenza-detail">
                    <ScadenzaDetails scadenzaId={selectedScadenzaId} onDeselectScadenza={onDeselectScadenza} />
                </div>
            )}
        </div>
    );
};

export default ScadenzaList;