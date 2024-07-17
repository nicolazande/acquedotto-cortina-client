import React, { useEffect, useState } from 'react';
import servizioApi from '../../api/servizioApi';
import ServizioDetails from './ServizioDetails';
import '../../styles/Servizio/ServizioList.css';

const ServizioList = ({ onSelectServizio, selectedServizioId, onDeselectServizio }) => {
    const [servizi, setServizi] = useState([]);

    useEffect(() => {
        const fetchServizi = async () => {
            try {
                const response = await servizioApi.getServizi();
                setServizi(response.data);
            } catch (error) {
                alert('Errore durante il recupero dei servizi');
                console.error(error);
            }
        };

        fetchServizi();
    }, []);

    const handleDelete = async (id) => {
        try {
            await servizioApi.deleteServizio(id);
            setServizi(servizi.filter(servizio => servizio._id !== id));
            if (selectedServizioId === id) {
                onDeselectServizio();
            }
        } catch (error) {
            alert('Errore durante la cancellazione del servizio');
            console.error(error);
        }
    };

    return (
        <div className="servizio-list-container">
            <div className="servizio-list">
                <h2>Lista Servizi</h2>
                <ul>
                    {servizi.map((servizio) => (
                        <li key={servizio._id} className="servizio-list-item">
                            <span>{servizio.descrizione}</span>
                            <button onClick={() => onSelectServizio(servizio._id)} className="btn btn-details">Dettagli</button>
                            <button onClick={() => handleDelete(servizio._id)} className="btn btn-delete">Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedServizioId && (
                <div className="servizio-detail">
                    <ServizioDetails servizioId={selectedServizioId} onDeselectServizio={onDeselectServizio} />
                </div>
            )}
        </div>
    );
};

export default ServizioList;