import React, { useEffect, useState } from 'react';
import articoloApi from '../../api/articoloApi';
import servizioApi from '../../api/servizioApi';
import '../../styles/Articolo/ArticoloDetails.css';

const ArticoloDetails = ({ articoloId, onDeselectArticolo }) =>
{
    const [articolo, setArticolo] = useState(null);
    const [servizi, setServizi] = useState([]);
    const [showServizi, setShowServizi] = useState(false);
    const [showServizioModal, setShowServizioModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() =>
    {
        const fetchArticolo = async () =>
        {
            try
            {
                const response = await articoloApi.getArticolo(articoloId);
                setArticolo(response.data);
                setEditFormData(response.data);
                setShowServizi(false);
            }
            catch (error)
            {
                alert('Errore durante il recupero dell\'articolo');
                console.error(error);
            }
        };

        if (articoloId)
        {
            fetchArticolo();
        }

        setShowServizioModal(false);
    }, [articoloId]);

    const handleOpenServizioModal = async () =>
    {
        try
        {
            const response = await servizioApi.getServizi();
            setServizi(response.data);
            setShowServizioModal(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero dei servizi');
            console.error(error);
        }
    };

    const handleSelectServizio = async (servizioId) =>
    {
        try
        {
            await articoloApi.associateServizio(articoloId, servizioId);
            setShowServizioModal(false);
            fetchServiziAssociati();
        }
        catch (error)
        {
            alert('Errore durante l\'associazione del servizio');
            console.error(error);
        }
    };

    const fetchServiziAssociati = async () =>
    {
        try
        {
            const response = await articoloApi.getServizi(articoloId);
            setServizi(response.data);
            setShowServizi(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero dei servizi');
            console.error(error);
        }
    };

    const handleEditChange = (e) =>
    {
        const { name, value } = e.target;
        setEditFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleEditSubmit = async (e) =>
    {
        e.preventDefault();
        try
        {
            await articoloApi.updateArticolo(articoloId, editFormData);
            setArticolo(editFormData);
            setIsEditing(false);
            alert('Articolo aggiornato con successo');
        }
        catch (error)
        {
            alert('Errore durante l\'aggiornamento dell\'articolo');
            console.error(error);
        }
    };

    if (!articolo)
    {
        return <div>Seleziona un articolo per vedere i dettagli</div>;
    }

    return (
        <div className="articolo-details">
            <h2>Dettagli Articolo</h2>
            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Codice:</label>
                        <input type="text" name="codice" value={editFormData.codice} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Descrizione:</label>
                        <input type="text" name="descrizione" value={editFormData.descrizione} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>IVA:</label>
                        <input type="number" name="iva" value={editFormData.iva} onChange={handleEditChange} required />
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
                                <th>Codice</th>
                                <td>{articolo.codice}</td>
                            </tr>
                            <tr>
                                <th>Descrizione</th>
                                <td>{articolo.descrizione}</td>
                            </tr>
                            <tr>
                                <th>IVA</th>
                                <td>{articolo.iva}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="btn-container">
                        <button onClick={handleOpenServizioModal} className="btn btn-associate-servizio">Associa Servizio</button>
                        <button onClick={fetchServiziAssociati} className="btn btn-show-servizi">Visualizza Servizi</button>
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={onDeselectArticolo} className="btn btn-back">Indietro</button>
            </div>
            {showServizi && (
                <div className="servizi-section">
                    <h3>Servizi Associati</h3>
                    <table className="servizi-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Valore</th>
                                <th>Tariffa</th>
                                <th>m3</th>
                                <th>Prezzo</th>
                                <th>Seriale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servizi.length === 0 ? (
                                <tr>
                                    <td colSpan="6">Nessun servizio associato</td>
                                </tr>
                            ) : (
                                servizi.map((servizio) => (
                                    <tr key={servizio._id}>
                                        <td>{servizio.descrizione}</td>
                                        <td>{servizio.valore}</td>
                                        <td>{servizio.tariffa}</td>
                                        <td>{servizio.m3}</td>
                                        <td>{servizio.prezzo}</td>
                                        <td>{servizio.seriale}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {showServizioModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Servizio</h3>
                        <ul>
                            {servizi.map((servizio) => (
                                <li key={servizio._id} onClick={() => handleSelectServizio(servizio._id)}>
                                    {servizio.descrizione}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowServizioModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticoloDetails;