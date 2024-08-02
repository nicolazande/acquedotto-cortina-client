import React, { useEffect, useState } from 'react';
import fasciaApi from '../../api/fasciaApi';
import listinoApi from '../../api/listinoApi';
import '../../styles/Fascia/FasciaDetails.css';

const FasciaDetails = ({ fasciaId, onDeselectFascia }) =>
{
    const [fascia, setFascia] = useState(null);
    const [listino, setListino] = useState(null);
    const [showListinoModal, setShowListinoModal] = useState(false);
    const [listini, setListini] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() =>
    {
        const fetchFascia = async () =>
        {
            try
            {
                const response = await fasciaApi.getFascia(fasciaId);
                setFascia(response.data);
                setEditFormData(response.data);

                if (response.data.listino)
                {
                    fetchListino(response.data.listino);
                }
            }
            catch (error)
            {
                alert('Errore durante il recupero della fascia');
                console.error(error);
            }
        };

        const fetchListino = async (listinoId) => 
        {
            try 
            {
                const response = await listinoApi.getListino(listinoId);
                setListino(response.data);
            } 
            catch (error) 
            {
                alert('Errore durante il recupero del listino');
                console.error(error);
            }
        };

        if (fasciaId) 
        {
            fetchFascia();
        }
    }, [fasciaId]);

    const handleOpenListinoModal = async () => 
    {
        try 
        {
            const response = await listinoApi.getListini(); // Aggiungi una funzione getListini() in listinoApi se non esiste
            setListini(response.data);
            setShowListinoModal(true);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero dei listini');
            console.error(error);
        }
    };

    const handleSelectListino = async (listinoId) => 
    {
        try 
        {
            await fasciaApi.associateListino(fasciaId, listinoId);
            setShowListinoModal(false);
            const response = await listinoApi.getListino(listinoId);
            setListino(response.data);
        } 
        catch (error) 
        {
            alert('Errore durante l\'associazione del listino');
            console.error(error);
        }
    };

    const handleEditChange = (e) =>
    {
        const { name, value, type, checked } = e.target;
        setEditFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleEditSubmit = async (e) => 
    {
        e.preventDefault();
        try 
        {
            await fasciaApi.updateFascia(fasciaId, editFormData);
            setFascia(editFormData);
            setIsEditing(false);
            alert('Fascia aggiornata con successo');
        } 
        catch (error) 
        {
            alert('Errore durante l\'aggiornamento della fascia');
            console.error(error);
        }
    };

    if (!fascia)
    {
        return <div>Seleziona una fascia per vedere i dettagli</div>;
    }

    return (
        <div className="fascia-detail">
            <h2>Dettagli Fascia</h2>
            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Tipo:</label>
                        <input type="text" name="tipo" value={editFormData.tipo} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Min:</label>
                        <input type="number" name="min" value={editFormData.min} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Max:</label>
                        <input type="number" name="max" value={editFormData.max} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Prezzo:</label>
                        <input type="number" name="prezzo" value={editFormData.prezzo} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Scadenza:</label>
                        <input type="date" name="scadenza" value={editFormData.scadenza ? new Date(editFormData.scadenza).toISOString().substring(0, 10) : ''} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Fisso:</label>
                        <input type="checkbox" name="fisso" checked={editFormData.fisso} onChange={handleEditChange} />
                    </div>
                    <div className="btn-container">
                        <button type="submit" className="btn btn-save">Salva</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-cancel">Annulla</button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="table-container">
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Tipo</th>
                                    <td>{fascia.tipo}</td>
                                </tr>
                                <tr>
                                    <th>Min</th>
                                    <td>{fascia.min}</td>
                                </tr>
                                <tr>
                                    <th>Max</th>
                                    <td>{fascia.max}</td>
                                </tr>
                                <tr>
                                    <th>Prezzo</th>
                                    <td>{fascia.prezzo}</td>
                                </tr>
                                <tr>
                                    <th>Scadenza</th>
                                    <td>{fascia.scadenza ? new Date(fascia.scadenza).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Fisso</th>
                                    <td>{fascia.fisso ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Listino</th>
                                    <td>{listino ? `${listino.categoria} - ${listino.descrizione}` : 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="btn-container">
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
                        <button onClick={handleOpenListinoModal} className="btn btn-associate-listino">Associa Listino</button>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={onDeselectFascia} className="btn btn-back">Indietro</button>
            </div>
            {showListinoModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Listino</h3>
                        <ul>
                            {listini.map((listino) => (
                                <li key={listino._id} onClick={() => handleSelectListino(listino._id)}>
                                    {listino.categoria} - {listino.descrizione}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowListinoModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FasciaDetails;