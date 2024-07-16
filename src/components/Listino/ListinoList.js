import React, { useEffect, useState } from 'react';
import listinoApi from '../../api/listinoApi';
import ListinoDetails from './ListinoDetails';
import '../../styles/Listino/ListinoList.css';

const ListinoList = ({ onSelectListino, selectedListinoId, onDeselectListino }) => {
    const [listini, setListini] = useState([]);

    useEffect(() => {
        const fetchListini = async () => {
            try {
                const response = await listinoApi.getListini();
                setListini(response.data);
            } catch (error) {
                alert('Errore durante il recupero dei listini');
                console.error(error);
            }
        };

        fetchListini();
    }, []);

    const handleDelete = async (id) => {
        try {
            await listinoApi.deleteListino(id);
            setListini(listini.filter(listino => listino._id !== id));
            if (selectedListinoId === id) {
                onDeselectListino();
            }
        } catch (error) {
            alert('Errore durante la cancellazione del listino');
            console.error(error);
        }
    };

    return (
        <div className="listino-list-container">
            <div className="listino-list">
                <h2>Lista Listini</h2>
                <ul>
                    {listini.map((listino) => (
                        <li key={listino._id} className="listino-list-item">
                            <span>{listino.categoria} - {listino.descrizione}</span>
                            <button onClick={() => onSelectListino(listino._id)} className="btn btn-details">Dettagli</button>
                            <button onClick={() => handleDelete(listino._id)} className="btn btn-delete">Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedListinoId && (
                <div className="listino-detail">
                    <ListinoDetails listinoId={selectedListinoId} />
                    <button onClick={onDeselectListino} className="btn btn-back">Indietro</button>
                </div>
            )}
        </div>
    );
};

export default ListinoList;