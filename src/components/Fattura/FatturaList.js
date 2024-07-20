import React, { useEffect, useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import FatturaDetails from './FatturaDetails';
import '../../styles/Fattura/FatturaList.css';

const FatturaList = ({ onSelectFattura, selectedFatturaId, onDeselectFattura }) =>
{
    const [fatture, setFatture] = useState([]);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => 
    {
        const fetchFatture = async () => 
        {
            try 
            {
                const response = await fatturaApi.getFatture();
                setFatture(response.data);
            } 
            catch (error) 
            {
                alert('Errore durante il recupero delle fatture');
                console.error(error);
            }
        };

        fetchFatture();
    }, []);

    const handleSelectFattura = (fatturaId) => 
    {
        setShowDetails(false); // Nascondi i dettagli correnti
        setTimeout(() => 
        {
            onSelectFattura(fatturaId);
            setShowDetails(true); // Mostra i nuovi dettagli dopo una piccola pausa per garantire che i vecchi dettagli siano chiusi
        }, 0);
    };

    const handleDelete = async (id) => 
    {
        try 
        {
            await fatturaApi.deleteFattura(id);
            setFatture(fatture.filter(fattura => fattura._id !== id));
            if (selectedFatturaId === id) 
            {
                onDeselectFattura();
            }
        } 
        catch (error) 
        {
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
                        <li
                            key={fattura._id}
                            id={fattura._id}
                            className={`fattura-list-item ${fattura._id === selectedFatturaId ? 'highlight' : ''}`}
                        >
                            <span>{fattura.tipo} - {fattura.ragioneSociale}</span>
                            <button className="btn" onClick={() => handleSelectFattura(fattura._id)}>Dettagli</button>
                            <button className="btn btn-delete" onClick={() => handleDelete(fattura._id)}>Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {showDetails && selectedFatturaId && (
                <div className="fattura-detail">
                    <FatturaDetails fatturaId={selectedFatturaId} onDeselectFattura={onDeselectFattura} />
                </div>
            )}
        </div>
    );
};

export default FatturaList;