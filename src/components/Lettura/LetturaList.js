import React, { useEffect, useState } from 'react';
import letturaApi from '../../api/letturaApi';
import '../../styles/Lettura/LetturaList.css'

const LetturaList = ({ onSelectLettura }) => {
    const [letture, setLetture] = useState([]);

    useEffect(() => {
        const fetchLetture = async () => {
            try {
                const response = await letturaApi.getLetture();
                setLetture(response.data);
            } catch (error) {
                alert('Errore durante il recupero delle letture');
                console.error(error);
            }
        };

        fetchLetture();
    }, []);

    const handleDelete = async (id) => {
        try {
            await letturaApi.deleteLettura(id);
            setLetture(letture.filter(lettura => lettura._id !== id));
        } catch (error) {
            alert('Errore durante la cancellazione della lettura');
            console.error(error);
        }
    };

    return (
        <div className="lettura-list">
            <h2>Lista Letture</h2>
            <ul>
                {letture.map((lettura) => (
                    <li key={lettura._id} className="lettura-list-item">
                        <span>{lettura.tipo} - {lettura.data} - {lettura.valore} {lettura.UdM}</span>
                        <div>
                            <button onClick={() => onSelectLettura(lettura._id)} className="btn btn-details">Dettagli</button>
                            <button onClick={() => handleDelete(lettura._id)} className="btn btn-delete">Cancella</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LetturaList;
