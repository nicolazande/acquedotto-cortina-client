import React, { useEffect, useState } from 'react';
import servizioApi from '../../api/servizioApi';
import letturaApi from '../../api/letturaApi';
import articoloApi from '../../api/articoloApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Servizio/ServizioDetails.css';

const ServizioDetails = ({ servizioId, onDeselectServizio }) => 
{
    const [servizio, setServizio] = useState(null);
    const [letture, setLetture] = useState([]);
    const [articoli, setArticoli] = useState([]);
    const [fatture, setFatture] = useState([]);
    const [showLetturaModal, setShowLetturaModal] = useState(false);
    const [showArticoloModal, setShowArticoloModal] = useState(false);
    const [showFatturaModal, setShowFatturaModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => 
    {
        const fetchServizio = async () => 
        {
            try 
            {
                const response = await servizioApi.getServizio(servizioId);
                setServizio(response.data);
                setEditFormData(response.data);
            } 
            catch (error) 
            {
                alert('Errore durante il recupero del servizio');
                console.error(error);
            }
        };

        if (servizioId) 
        {
            fetchServizio();
        }

        setShowLetturaModal(false);
        setShowArticoloModal(false);
        setShowFatturaModal(false);
    }, [servizioId]);

    const handleOpenLetturaModal = async () => 
    {
        try 
        {
            const response = await letturaApi.getLetture();
            setLetture(response.data);
            setShowLetturaModal(true);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero delle letture');
            console.error(error);
        }
    };

    const handleOpenArticoloModal = async () => 
    {
        try 
        {
            const response = await articoloApi.getArticoli();
            setArticoli(response.data);
            setShowArticoloModal(true);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero degli articoli');
            console.error(error);
        }
    };

    const handleOpenFatturaModal = async () => 
    {
        try 
        {
            const response = await fatturaApi.getFatture();
            setFatture(response.data);
            setShowFatturaModal(true);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero delle fatture');
            console.error(error);
        }
    };

    const handleSelectLettura = async (letturaId) => 
    {
        try 
        {
            await servizioApi.associateLettura(servizioId, letturaId);
            setShowLetturaModal(false);
            const response = await servizioApi.getServizio(servizioId);
            setServizio(response.data);
        } 
        catch (error) 
        {
            alert('Errore durante l\'associazione della lettura');
            console.error(error);
        }
    };

    const handleSelectArticolo = async (articoloId) => 
    {
        try 
        {
            await servizioApi.associateArticolo(servizioId, articoloId);
            setShowArticoloModal(false);
            const response = await servizioApi.getServizio(servizioId);
            setServizio(response.data);
        } 
        catch (error) 
        {
            alert('Errore durante l\'associazione dell\'articolo');
            console.error(error);
        }
    };

    const handleSelectFattura = async (fatturaId) => 
    {
        try 
        {
            await servizioApi.associateFattura(servizioId, fatturaId);
            setShowFatturaModal(false);
            const response = await servizioApi.getServizio(servizioId);
            setServizio(response.data);
        } 
        catch (error) 
        {
            alert('Errore durante l\'associazione della fattura');
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
            await servizioApi.updateServizio(servizioId, editFormData);
            setServizio(editFormData);
            setIsEditing(false);
            alert('Servizio aggiornato con successo');
        } 
        catch (error) 
        {
            alert('Errore durante l\'aggiornamento del servizio');
            console.error(error);
        }
    };

    if (!servizio) 
    {
        return <div>Seleziona un servizio per vedere i dettagli</div>;
    }

    return (
        <div className="servizio-details">
            <h2>Dettagli Servizio</h2>
            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Descrizione:</label>
                        <input type="text" name="descrizione" value={editFormData.descrizione} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Valore:</label>
                        <input type="number" name="valore" value={editFormData.valore} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Tariffa:</label>
                        <input type="number" name="tariffa" value={editFormData.tariffa} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>m3:</label>
                        <input type="number" name="m3" value={editFormData.m3} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Prezzo:</label>
                        <input type="number" name="prezzo" value={editFormData.prezzo} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Seriale:</label>
                        <input type="text" name="seriale" value={editFormData.seriale} onChange={handleEditChange} />
                    </div>
                    <div className="btn-container">
                        <button type="submit" className="btn btn-save">Salva</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-cancel">Annulla</button>
                    </div>
                </form>
            ) : (
                <>
                    <table className="info-table">
                        <tbody>
                            <tr>
                                <th>Descrizione</th>
                                <td>{servizio.descrizione}</td>
                            </tr>
                            <tr>
                                <th>Valore</th>
                                <td>{servizio.valore}</td>
                            </tr>
                            <tr>
                                <th>Tariffa</th>
                                <td>{servizio.tariffa}</td>
                            </tr>
                            <tr>
                                <th>m3</th>
                                <td>{servizio.m3}</td>
                            </tr>
                            <tr>
                                <th>Prezzo</th>
                                <td>{servizio.prezzo}</td>
                            </tr>
                            <tr>
                                <th>Seriale</th>
                                <td>{servizio.seriale}</td>
                            </tr>
                            <tr>
                                <th>Lettura</th>
                                <td>{servizio.lettura ? `${servizio.lettura.cliente} - ${new Date(servizio.lettura.data).toLocaleDateString()}` : 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Articolo</th>
                                <td>{servizio.articolo ? servizio.articolo.descrizione : 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Fattura</th>
                                <td>{servizio.fattura ? servizio.fattura.codice : 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="btn-container">
                        <button onClick={handleOpenLetturaModal} className="btn btn-associate-lettura">Associa Lettura</button>
                        <button onClick={handleOpenArticoloModal} className="btn btn-associate-articolo">Associa Articolo</button>
                        <button onClick={handleOpenFatturaModal} className="btn btn-associate-fattura">Associa Fattura</button>
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={onDeselectServizio} className="btn btn-back">Indietro</button>
            </div>
            {showLetturaModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Lettura</h3>
                        <ul>
                            {letture.map((lettura) => (
                                <li key={lettura._id} onClick={() => handleSelectLettura(lettura._id)}>
                                    {`${lettura.cliente} - ${new Date(lettura.data).toLocaleDateString()}`}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowLetturaModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
            {showArticoloModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Articolo</h3>
                        <ul>
                            {articoli.map((articolo) => (
                                <li key={articolo._id} onClick={() => handleSelectArticolo(articolo._id)}>
                                    {articolo.descrizione}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowArticoloModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
            {showFatturaModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Fattura</h3>
                        <ul>
                            {fatture.map((fattura) => (
                                <li key={fattura._id} onClick={() => handleSelectFattura(fattura._id)}>
                                    {fattura.codice}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowFatturaModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServizioDetails;