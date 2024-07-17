import React, { useEffect, useState } from 'react';
import contatoreApi from '../../api/contatoreApi';
import ContatoreDetails from './ContatoreDetails';
import '../../styles/Contatore/ContatoreList.css';

const ContatoreList = ({ onSelectContatore, selectedContatoreId, onDeselectContatore }) => {
    const [contatori, setContatori] = useState([]);
    const [showDetails, setShowDetails] = useState(false);

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

    const handleSelectContatore = (contatoreId) => {
        setShowDetails(false); // Nascondi i dettagli correnti
        setTimeout(() => {
            onSelectContatore(contatoreId);
            setShowDetails(true); // Mostra i nuovi dettagli dopo una piccola pausa per garantire che i vecchi dettagli siano chiusi
        }, 0);
    };

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
                        <li
                            key={contatore._id}
                            id={contatore._id}
                            className={`contatore-list-item ${contatore._id === selectedContatoreId ? 'highlight' : ''}`}
                        >
                            <span>{contatore.seriale}</span>
                            <button className="btn" onClick={() => handleSelectContatore(contatore._id)}>Dettagli</button>
                            <button className="btn btn-delete" onClick={() => handleDelete(contatore._id)}>Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {showDetails && selectedContatoreId && (
                <div className="contatore-detail">
                    <ContatoreDetails contatoreId={selectedContatoreId} onDeselectContatore={onDeselectContatore} />
                </div>
            )}
        </div>
    );
};

export default ContatoreList;