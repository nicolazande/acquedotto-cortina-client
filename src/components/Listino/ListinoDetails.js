import React, { useEffect, useState } from 'react';
import listinoApi from '../../api/listinoApi';
import contatoreApi from '../../api/contatoreApi';
import fasciaApi from '../../api/fasciaApi';
import '../../styles/Listino/ListinoDetails.css';

const ListinoDetails = ({ listinoId, onDeselectListino }) =>
{
    const [listino, setListino] = useState(null);
    const [fasce, setFasce] = useState([]);
    const [contatori, setContatori] = useState([]);
    const [showFasceModal, setShowFasceModal] = useState(false);
    const [showContatoreModal, setShowContatoreModal] = useState(false);
    const [showFasce, setShowFasce] = useState(false);
    const [showContatori, setShowContatori] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => 
    {
        if (listinoId) 
        {
            const fetchListino = async () => 
            {
                try 
                {
                    const response = await listinoApi.getListino(listinoId);
                    setListino(response.data);
                    setEditFormData(response.data);
                } 
                catch (error) 
                {
                    alert('Errore durante il recupero del listino');
                    console.error(error);
                }
            };

            fetchListino();
        }

        setShowFasceModal(false);
        setShowContatoreModal(false);
        setShowFasce(false);
        setShowContatori(false);
    }, [listinoId]);

    const handleOpenFasceModal = async () => 
    {
        try 
        {
            const response = await fasciaApi.getFasce();
            setFasce(response.data);
            setShowFasceModal(true);
            setShowFasce(false);
            setShowContatoreModal(false);
            setShowContatori(false);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero delle fasce');
            console.error(error);
        }
    };

    const handleOpenContatoreModal = async () => 
    {
        try
        {
            const response = await contatoreApi.getContatori();
            setContatori(response.data);
            setShowContatoreModal(true);
            setShowContatori(false);
            setShowFasce(false);
            setShowFasceModal(false);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleSelectFascia = async (fasciaId) => 
    {
        try 
        {
            await listinoApi.associateFascia(listinoId, fasciaId);
            setShowFasceModal(false);
            fetchFasceAssociati();
        } 
        catch (error) 
        {
            alert('Errore durante l\'associazione della fascia');
            console.error(error);
        }
    };

    const handleSelectContatore = async (contatoreId) => 
    {
        try 
        {
            await listinoApi.associateContatore(listinoId, contatoreId);
            setShowContatoreModal(false);
            fetchContatoriAssociati();
        } 
        catch (error) 
        {
            alert('Errore durante l\'associazione del contatore');
            console.error(error);
        }
    };

    const fetchFasceAssociati = async () => 
    {
        try 
        {
            const response = await listinoApi.getFasce(listinoId);
            setFasce(response.data);
            setShowFasce(true);
            setShowFasceModal(false);
            setShowContatoreModal(false);
            setShowContatori(false);
        } 
        catch (error)
        {
            alert('Errore durante il recupero delle fasce');
            console.error(error);
        }
    };

    const fetchContatoriAssociati = async () => 
    {
        try 
        {
            const response = await listinoApi.getContatori(listinoId);
            setContatori(response.data);
            setShowContatoreModal(false);
            setShowContatori(true);
            setShowFasce(false);
            setShowFasceModal(false);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero dei contatori');
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
            await listinoApi.updateListino(listinoId, editFormData);
            setListino(editFormData);
            setIsEditing(false);
            alert('Listino aggiornato con successo');
        } 
        catch (error) 
        {
            alert('Errore durante l\'aggiornamento del listino');
            console.error(error);
        }
    };

    if (!listino) 
    {
        return <div>Caricamento...</div>;
    }

    return (
        <div className="listino-detail">
            <h2>Dettagli Listino</h2>
            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Categoria:</label>
                        <input type="text" name="categoria" value={editFormData.categoria} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Descrizione:</label>
                        <input type="text" name="descrizione" value={editFormData.descrizione} onChange={handleEditChange} required />
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
                                    <th>Categoria</th>
                                    <td>{listino.categoria}</td>
                                </tr>
                                <tr>
                                    <th>Descrizione</th>
                                    <td>{listino.descrizione}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="btn-container">
                        <button onClick={handleOpenFasceModal} className="btn btn-associate-fascia">Associa Fascia</button>
                        <button onClick={handleOpenContatoreModal} className="btn btn-associate-contatore">Associa Contatore</button>
                        <button onClick={fetchFasceAssociati} className="btn btn-show-fasce">Visualizza Fasce</button>
                        <button onClick={fetchContatoriAssociati} className="btn btn-show-contatori">Visualizza Contatori</button>
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={onDeselectListino} className="btn btn-back">Indietro</button>
            </div>
            {showFasce && (
                <div className="fasce-section">
                    <h3>Fasce Associate</h3>
                    <table className="fasce-table">
                        <thead>
                            <tr>
                                <th>tipo</th>
                                <th>min</th>
                                <th>max</th>
                                <th>prezzo</th>
                                <th>scadenza</th>
                                <th>fisso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fasce.length === 0 ? (
                                <tr>
                                    <td colSpan="3">Nessuna fascia associata</td>
                                </tr>
                            ) : (
                                fasce.map((fascia) => (
                                    <tr key={fascia._id}>
                                        <td>{fascia.tipo}</td>
                                        <td>{fascia.min}</td>
                                        <td>{fascia.max}</td>
                                        <td>{fascia.prezzo}</td>
                                        <td>{new Date(fascia.scadenza).toLocaleDateString()}</td>
                                        <td>{fascia.fisso}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {showContatori && (
                <div className="contatori-section">
                    <h3>Contatori Associati</h3>
                    <table className="contatori-table">
                        <thead>
                            <tr>
                                <th>Seriale</th>
                                <th>Seriale Interno</th>
                                <th>Ultima Lettura</th>
                                <th>Inattivo</th>
                                <th>Condominiale</th>
                                <th>Sostituzione</th>
                                <th>Subentro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contatori.length === 0 ? (
                                <tr>
                                    <td colSpan="3">Nessun contatore associata</td>
                                </tr>
                            ) : (
                                contatori.map((contatore) => (
                                <tr key={contatore._id}>
                                    <td>{contatore.seriale}</td>
                                    <td>{contatore.serialeInterno}</td>
                                    <td>{new Date(contatore.ultimaLettura).toLocaleDateString()}</td>
                                    <td><input type="checkbox" checked={!contatore.attivo} readOnly /></td>
                                    <td><input type="checkbox" checked={contatore.condominiale} readOnly /></td>
                                    <td><input type="checkbox" checked={contatore.sostituzione} readOnly /></td>
                                    <td><input type="checkbox" checked={contatore.subentro} readOnly /></td>
                                </tr>))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {showFasceModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Fascia</h3>
                        <ul>
                            {fasce.map((fascia) => (
                                <li key={fascia._id} onClick={() => handleSelectFascia(fascia._id)}>
                                    {fascia.tipo}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowFasceModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
            {showContatoreModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Contatore</h3>
                        <ul>
                            {contatori.map((contatore) => (
                                <li key={contatore._id} onClick={() => handleSelectContatore(contatore._id)}>
                                    {contatore.seriale}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowContatoreModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListinoDetails;