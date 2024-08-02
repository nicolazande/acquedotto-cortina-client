import React, { useEffect, useState } from 'react';
import letturaApi from '../../api/letturaApi';
import LetturaDetails from './LetturaDetails';
import '../../styles/Lettura/LetturaList.css';

const LetturaList = ({ onSelectLettura, selectedLetturaId, onDeselectLettura }) => 
{
    const [letture, setLetture] = useState([]);

    useEffect(() => 
    {
        const fetchLetture = async () => 
        {
            try 
            {
                const response = await letturaApi.getLetture();
                setLetture(response.data);
            } 
            catch (error) 
            {
                alert('Errore durante il recupero delle letture');
                console.error(error);
            }
        };

        fetchLetture();
    }, []);

    const handleDelete = async (id) => 
    {
        try 
        {
            await letturaApi.deleteLettura(id);
            setLetture(letture.filter(lettura => lettura._id !== id));
            if (selectedLetturaId === id) 
            {
                onDeselectLettura();
            }
        } 
        catch (error)
        {
            alert('Errore durante la cancellazione della lettura');
            console.error(error);
        }
    };

    return (
        <div className="lettura-list-container">
            <div className="lettura-list">
                <h2>Lista Letture</h2>
                <div className="table-container">
                    <table className="lettura-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {letture.map((lettura) => (
                                <tr
                                    key={lettura._id}
                                    id={lettura._id}
                                    className={`lettura-list-item ${lettura._id === selectedLetturaId ? 'highlight' : ''}`}
                                >
                                    <td>{new Date(lettura.data).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn" onClick={(e) => { e.stopPropagation(); onSelectLettura(lettura._id); }}>Dettagli</button>
                                        <button className="btn btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(lettura._id); }}>Cancella</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedLetturaId && (
                <div className="lettura-detail">
                    <LetturaDetails letturaId={selectedLetturaId} onDeselectLettura={onDeselectLettura} />
                </div>
            )}
        </div>
    );
};

export default LetturaList;