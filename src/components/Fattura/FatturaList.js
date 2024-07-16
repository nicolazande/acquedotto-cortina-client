import React, { useEffect, useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import FatturaDetails from './FatturaDetails';
import '../../styles/Fattura/FatturaList.css';

const FatturaList = ({ onSelectFattura, selectedFatturaId, onDeselectFattura }) => {
    const [fatture, setFatture] = useState([]);

    useEffect(() => {
        const fetchFatture = async () => {
            try {
                const response = await fatturaApi.getFatture();
                setFatture(response.data);
            } catch (error) {
                alert('Errore durante il recupero delle fatture');
                console.error(error);
            }
        };

        fetchFatture();
    }, []);

    const handleDelete = async (id) => {
        try {
            await fatturaApi.deleteFattura(id);
            setFatture(fatture.filter(fattura => fattura._id !== id));
            if (selectedFatturaId === id) {
                onDeselectFattura();
            }
        } catch (error) {
            alert('Errore durante la cancellazione della fattura');
            console.error(error);
        }
    };

    return (
        <div className="fattura-list-container">
            <div className="fattura-list">
                <h2>Lista Fatture</h2>
                <ul>
                    {fatture.map((fattura) => (
                        <li key={fattura._id} className="fattura-list-item">
                            <span>{fattura.tipo} - {fattura.ragioneSociale}</span>
                            <button onClick={() => onSelectFattura(fattura._id)} className="btn btn-details">Dettagli</button>
                            <button onClick={() => handleDelete(fattura._id)} className="btn btn-delete">Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedFatturaId && (
                <div className="fattura-detail">
                    <FatturaDetails fatturaId={selectedFatturaId} />
                    <button onClick={onDeselectFattura} className="btn btn-back">Indietro</button>
                </div>
            )}
        </div>
    );
};

export default FatturaList;