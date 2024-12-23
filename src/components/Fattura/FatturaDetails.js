import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import fatturaApi from '../../api/fatturaApi';
import clienteApi from '../../api/clienteApi';
import servizioApi from '../../api/servizioApi';
import '../../styles/Fattura/FatturaDetails.css';
import FatturaEditor from '../shared/FatturaEditor';

const FatturaDetails = () => {
    const { id: fatturaId } = useParams(); // Extract `fatturaId` from the route
    const history = useHistory();
    const [fattura, setFattura] = useState(null);
    const [servizi, setServizi] = useState([]);
    const [clienti, setClienti] = useState([]);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showServizioModal, setShowServizioModal] = useState(false);
    const [showServizi, setShowServizi] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');

    const fetchFattura = useCallback(async () => {
        try {
            const response = await fatturaApi.getFattura(fatturaId);
            setFattura(response.data);
        } catch (error) {
            console.error('Errore durante il recupero della fattura', error);
        }
    }, [fatturaId]);

    useEffect(() => {
        if (fatturaId) {
            fetchFattura();
        }
        setShowClienteModal(false);
        setShowServizioModal(false);
        setShowServizi(false);
    }, [fatturaId, fetchFattura]);

    const fetchServiziAssociati = async () => {
        try {
            const response = await fatturaApi.getServizi(fatturaId);
            setServizi(response.data);
            setShowServizi(true);
        } catch (error) {
            console.error('Errore durante il recupero dei servizi', error);
        }
    };

    const handleOpenClienteModal = async () => {
        try {
            const response = await clienteApi.getClienti();
            setClienti(response.data);
            setShowClienteModal(true);
        } catch (error) {
            console.error('Errore durante il recupero dei clienti', error);
        }
    };

    const handleOpenServizioModal = async () => {
        try {
            const response = await servizioApi.getServizi();
            setServizi(response.data);
            setShowServizioModal(true);
        } catch (error) {
            console.error('Errore durante il recupero dei servizi', error);
        }
    };

    const handleSelectCliente = async (clienteId) => {
        try {
            await fatturaApi.associateCliente(fatturaId, clienteId);
            setShowClienteModal(false);
            fetchFattura();
        } catch (error) {
            console.error('Errore durante l\'associazione del cliente', error);
        }
    };

    const handleSelectServizio = async (servizioId) => {
        try {
            await fatturaApi.associateServizio(fatturaId, servizioId);
            setShowServizioModal(false);
            fetchServiziAssociati();
        } catch (error) {
            console.error('Errore durante l\'associazione del servizio', error);
        }
    };

    const handleSaveFattura = async (updatedFattura) => {
        try {
            await fatturaApi.updateFattura(fatturaId, updatedFattura);
            setFattura(updatedFattura);
            setIsEditing(false);
            alert('Fattura aggiornata con successo');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento della fattura', error);
        }
    };

    const handleBackClick = () => {
        history.goBack(); // Navigate back to the previous route
    };

    if (!fattura) {
        return <div>Seleziona una fattura per vedere i dettagli</div>;
    }

    return (
        <div className="fattura-details">
            <h2>Dettagli Fattura</h2>
            {isEditing ? (
                <FatturaEditor
                    fattura={fattura}
                    onSave={handleSaveFattura}
                    onCancel={() => setIsEditing(false)}
                    mode="Modifica"
                />
            ) : (
                <>
                    <div className="table-container">
                        <div className="search-container">
                            <button onClick={() => setIsEditing(true)} className="btn btn-edit">
                                Modifica
                            </button>
                        </div>
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Tipo Documento</th>
                                    <td>{fattura.tipo_documento || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Ragione Sociale</th>
                                    <td>{fattura.ragione_sociale || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Anno</th>
                                    <td>{fattura.anno || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Numero</th>
                                    <td>{fattura.numero || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Data</th>
                                    <td>{fattura.data_fattura ? new Date(fattura.data_fattura).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Confermata</th>
                                    <td>{fattura.confermata ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Codice</th>
                                    <td>{fattura.codice || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Cliente</th>
                                    <td>{fattura.cliente ? `${fattura.cliente.nome} ${fattura.cliente.cognome}` : 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tabs-container">
                        <div className="tabs">
                            {[
                                { id: 'cliente', label: 'Cliente' },
                                { id: 'servizi', label: 'Servizi' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className={`tab-content ${activeTab === 'cliente' ? 'show' : ''}`}>
                            {activeTab === 'cliente' && (
                                <div className="cliente-box">
                                    <button onClick={handleOpenClienteModal} className="btn btn-associate-cliente">
                                        Associa Cliente
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={`tab-content ${activeTab === 'servizi' ? 'show' : ''}`}>
                            {activeTab === 'servizi' && (
                                <div className="servizi-box">
                                    <button onClick={fetchServiziAssociati} className="btn btn-show-servizi">
                                        Visualizza Servizi
                                    </button>
                                    <button onClick={handleOpenServizioModal} className="btn btn-associate-servizio">
                                        Associa Servizio
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={handleBackClick} className="btn btn-back">Indietro</button>
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
                                <th>Prezzo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servizi.length === 0 ? (
                                <tr>
                                    <td colSpan="4">Nessun servizio associato</td>
                                </tr>
                            ) : (
                                servizi.map((servizio) => (
                                    <tr key={servizio._id}>
                                        <td>{servizio.descrizione}</td>
                                        <td>{servizio.valore}</td>
                                        <td>{servizio.tariffa}</td>
                                        <td>{servizio.prezzo}</td>
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
                            {clienti.map((cliente) => (
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
