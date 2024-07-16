import React, { useEffect, useState } from 'react';
import fasciaApi from '../../api/fasciaApi';
import FasciaDetails from './FasciaDetails';
import '../../styles/Fascia/FasciaList.css';

const FasciaList = ({ onSelectFascia, selectedFasciaId, onDeselectFascia }) => {
    const [fasce, setFasce] = useState([]);

    useEffect(() => {
        const fetchFasce = async () => {
            try {
                const response = await fasciaApi.getFasce();
                setFasce(response.data);
            } catch (error) {
                alert('Errore durante il recupero delle fasce');
                console.error(error);
            }
        };

        fetchFasce();
    }, []);

    const handleDelete = async (id) => {
        try {
            await fasciaApi.deleteFascia(id);
            setFasce(fasce.filter(fascia => fascia._id !== id));
            if (selectedFasciaId === id) {
                onDeselectFascia();
            }
        } catch (error) {
            alert('Errore durante la cancellazione della fascia');
            console.error(error);
        }
    };

    return (
        <div className="fascia-list-container">
            <div className="fascia-list">
                <h2>Lista Fasce</h2>
                <ul>
                    {fasce.map((fascia) => (
                        <li key={fascia._id} className="fascia-list-item">
                            <span>{fascia.tipo} - {fascia.descrizione}</span>
                            <button onClick={() => onSelectFascia(fascia._id)} className="btn btn-details">Dettagli</button>
                            <button onClick={() => handleDelete(fascia._id)} className="btn btn-delete">Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedFasciaId && (
                <div className="fascia-detail">
                    <FasciaDetails fasciaId={selectedFasciaId} />
                    <button onClick={onDeselectFascia} className="btn btn-back">Indietro</button>
                </div>
            )}
        </div>
    );
};

export default FasciaList;