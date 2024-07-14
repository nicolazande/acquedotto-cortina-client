import React, { useEffect, useState } from 'react';
import contatoreApi from '../../api/contatoreApi';
import ContatoreDetails from './ContatoreDetails';
import '../../styles/Contatore.css';

const ContatoreList = ({ onSelectContatore, selectedContatoreId, onDeselectContatore }) => {
    const [contatori, setContatori] = useState([]);

    useEffect(() => {
        const fetchContatori = async () => {
            try {
                const response = await contatoreApi.getContatori();
                setContatori(response.data);
            } catch (error) {
                alert('Errore durante il recupero dei contatori');
                console.error(error);
            }
        };

        fetchContatori();
    }, []);

    const handleDelete = async (id) => {
        try {
            await contatoreApi.deleteContatore(id);
            setContatori(contatori.filter(contatore => contatore._id !== id));
            if (selectedContatoreId === id) {
                onDeselectContatore();
            }
        } catch (error) {
            alert('Errore durante la cancellazione del contatore');
            console.error(error);
        }
    };

    return (
        <div className="contatore-list-container">
            <div className="contatore-list">
                <h2>Lista Contatori</h2>
                <ul>
                    {contatori.map((contatore) => (
                        <li key={contatore._id} className="contatore-list-item">
                            <span>{contatore.seriale}</span>
                            <button onClick={() => onSelectContatore(contatore._id)} className="btn btn-details">Dettagli</button>
                            <button onClick={() => handleDelete(contatore._id)} className="btn btn-delete">Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedContatoreId && (
                <div className="contatore-detail">
                    <ContatoreDetails contatoreId={selectedContatoreId} />
                    <button onClick={onDeselectContatore} className="btn btn-back">Indietro</button>
                </div>
            )}
        </div>
    );
};

export default ContatoreList;