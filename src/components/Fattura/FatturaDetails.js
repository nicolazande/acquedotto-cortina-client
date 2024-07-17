import React, { useEffect, useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import clienteApi from '../../api/clienteApi';
import servizioApi from '../../api/servizioApi';
import '../../styles/Fattura/FatturaDetails.css';

const FatturaDetails = ({ fatturaId, onDeselectFattura }) => {
    const [fattura, setFattura] = useState(null);
    const [cliente, setCliente] = useState(null);
    const [servizi, setServizi] = useState([]);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showServizioModal, setShowServizioModal] = useState(false);
    const [showServizi, setShowServizi] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        const fetchFattura = async () => {
            try {
                const response = await fatturaApi.getFattura(fatturaId);
                setFattura(response.data);
                setEditFormData(response.data);
                if (response.data.cliente) {
                    setCliente(response.data);
                }
            } catch (error) {
                alert('Errore durante il recupero della fattura');
                console.error(error);
            }
        };

        if (fatturaId) {
            fetchFattura();
        }

        setShowClienteModal(false);
        setShowServizioModal(false);
        setShowServizi(false);
    }, [fatturaId]);

    const handleOpenClienteModal = async () => {
        try {
            const response = await clienteApi.getClienti();
            setCliente(response.data);
            setShowClienteModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei clienti');
            console.error(error);
        }
    };

    const handleOpenServizioModal = async () => {
        try {
            const response = await servizioApi.getServizi();
            setServizi(response.data);
            setShowServizioModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei servizi');
            console.error(error);
        }
    };

    const handleSelectCliente = async (clienteId) => {
        try {
            await fatturaApi.associateCliente(fatturaId, clienteId);
            setShowClienteModal(false);
            const response = await fatturaApi.getFattura(fatturaId);
            setFattura(response.data);
        } catch (error) {
            alert('Errore durante l\'associazione del cliente');
            console.error(error);
        }
    };

    const handleSelectServizio = async (servizioId) => {
        try {
            await fatturaApi.associateServizio(fatturaId, servizioId);
            setShowServizioModal(false);
            fetchServiziAssociati();
        } catch (error) {
            alert('Errore durante l\'associazione del servizio');
            console.error(error);
        }
    };

    const fetchServiziAssociati = async () => {
        try {
            const response = await fatturaApi.getServizi(fatturaId);
            setServizi(response.data);
            setShowServizi(true);
        } catch (error) {
            alert('Errore durante il recupero dei servizi');
            console.error(error);
        }
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await fatturaApi.updateFattura(fatturaId, editFormData);
            setFattura(editFormData);
            setIsEditing(false);
            alert('Fattura aggiornata con successo');
        } catch (error) {
            alert('Errore durante l\'aggiornamento della fattura');
            console.error(error);
        }
    };

    if (!fattura) {
        return <div>Caricamento...</div>;
    }

    return (
        <div className="fattura-details">
            <h2>Dettagli Fattura</h2>
            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Tipo:</label>
                        <input type="text" name="tipo" value={editFormData.tipo} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Ragione Sociale:</label>
                        <input type="text" name="ragioneSociale" value={editFormData.ragioneSociale} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Anno:</label>
                        <input type="number" name="anno" value={editFormData.anno} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Numero:</label>
                        <input type="number" name="numero" value={editFormData.numero} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Data:</label>
                        <input type="date" name="data" value={editFormData.data} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Confermata:</label>
                        <input type="checkbox" name="confermata" checked={editFormData.confermata} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Codice:</label>
                        <input type="text" name="codice" value={editFormData.codice} onChange={handleEditChange} required />
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
                                <th>Tipo</th>
                                <td>{fattura.tipo}</td>
                            </tr>
                            <tr>
                                <th>Ragione Sociale</th>
                                <td>{fattura.ragioneSociale}</td>
                            </tr>
                            <tr>
                                <th>Anno</th>
                                <td>{fattura.anno}</td>
                            </tr>
                            <tr>
                                <th>Numero</th>
                                <td>{fattura.numero}</td>
                            </tr>
                            <tr>
                                <th>Data</th>
                                <td>{new Date(fattura.data).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <th>Confermata</th>
                                <td>{fattura.confermata ? 'Sì' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Codice</th>
                                <td>{fattura.codice}</td>
                            </tr>
                            <tr>
                                <th>Cliente</th>
                                <td>{fattura.cliente.nome} {fattura.cliente.cognome}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="btn-container">
                        <button onClick={handleOpenClienteModal} className="btn btn-associate-cliente">Associa Cliente</button>
                        <button onClick={handleOpenServizioModal} className="btn btn-associate-servizio">Associa Servizio</button>
                        <button onClick={fetchServiziAssociati} className="btn btn-show-servizi">Visualizza Servizi</button>
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={onDeselectFattura} className="btn btn-back">Indietro</button>
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
            {showClienteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Cliente</h3>
                        <ul>
                            {cliente.map((cliente) => (
                                <li key={cliente._id} onClick={() => handleSelectCliente(cliente._id)}>
                                    {cliente.nome} {cliente.cognome}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowClienteModal(false)}>Chiudi</button>
                    </div>
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

export default FatturaDetails;