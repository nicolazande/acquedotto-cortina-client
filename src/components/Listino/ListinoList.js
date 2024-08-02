import React, { useEffect, useState } from 'react';
import listinoApi from '../../api/listinoApi';
import ListinoDetails from './ListinoDetails';
import '../../styles/Listino/ListinoList.css';

const ListinoList = ({ onSelectListino, selectedListinoId, onDeselectListino }) => 
{
    const [listini, setListini] = useState([]);

    useEffect(() => 
    {
        const fetchListini = async () => 
        {
            try 
            {
                const response = await listinoApi.getListini();
                setListini(response.data);
            } 
            catch (error) 
            {
                alert('Errore durante il recupero dei listini');
                console.error(error);
            }
        };

        fetchListini();
    }, []);

    const handleDelete = async (id) => 
    {
        try 
        {
            await listinoApi.deleteListino(id);
            setListini(listini.filter(listino => listino._id !== id));
            if (selectedListinoId === id) 
            {
                onDeselectListino();
            }
        } 
        catch (error) 
        {
            alert('Errore durante la cancellazione del listino');
            console.error(error);
        }
    };

    return (
        <div className="listino-list-container">
            <div className="listino-list">
                <h2>Lista Listini</h2>
                <div className="table-container">
                    <table className="listino-table">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Descrizione</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listini.map((listino) => (
                                <tr key={listino._id} className="listino-list-item">
                                    <td>{listino.categoria}</td>
                                    <td>{listino.descrizione}</td>
                                    <td>
                                        <button onClick={() => onSelectListino(listino._id)} className="btn btn-details">Dettagli</button>
                                        <button onClick={() => handleDelete(listino._id)} className="btn btn-delete">Cancella</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedListinoId && (
                <div className="listino-detail">
                    <ListinoDetails listinoId={selectedListinoId} onDeselectListino={onDeselectListino} />
                </div>
            )}
        </div>
    );
};

export default ListinoList;