import React, { useEffect, useState } from 'react';
import articoloApi from '../../api/articoloApi';
import ArticoloDetails from './ArticoloDetails';
import '../../styles/Articolo/ArticoloList.css';

const ArticoloList = ({ onSelectArticolo, selectedArticoloId, onDeselectArticolo }) => {
    const [articoli, setArticoli] = useState([]);

    useEffect(() => {
        const fetchArticoli = async () => {
            try {
                const response = await articoloApi.getArticoli();
                setArticoli(response.data);
            } catch (error) {
                alert('Errore durante il recupero degli articoli');
                console.error(error);
            }
        };

        fetchArticoli();
    }, []);

    const handleDelete = async (id) => {
        try {
            await articoloApi.deleteArticolo(id);
            setArticoli(articoli.filter(articolo => articolo._id !== id));
            if (selectedArticoloId === id) {
                onDeselectArticolo();
            }
        } catch (error) {
            alert('Errore durante la cancellazione dell\'articolo');
            console.error(error);
        }
    };

    return (
        <div className="articolo-list-container">
            <div className="articolo-list">
                <h2>Lista Articoli</h2>
                <ul>
                    {articoli.map((articolo) => (
                        <li key={articolo._id} className="articolo-list-item">
                            <span>{articolo.codice} - {articolo.descrizione}</span>
                            <button onClick={() => onSelectArticolo(articolo._id)} className="btn btn-details">Dettagli</button>
                            <button onClick={() => handleDelete(articolo._id)} className="btn btn-delete">Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedArticoloId && (
                <div className="articolo-detail">
                    <ArticoloDetails articoloId={selectedArticoloId} onDeselectArticolo={onDeselectArticolo} />
                </div>
            )}
        </div>
    );
};

export default ArticoloList;