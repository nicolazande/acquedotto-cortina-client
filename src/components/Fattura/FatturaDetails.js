import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import fatturaApi from '../../api/fatturaApi';
import clienteApi from '../../api/clienteApi';
import servizioApi from '../../api/servizioApi';
import scadenzaApi from '../../api/scadenzaApi';
import '../../styles/Fattura/FatturaDetails.css';
import FatturaEditor from '../shared/FatturaEditor';
import ClienteList from '../Cliente/ClienteList';
import ServizioList from '../Servizio/ServizioList';
import ScadenzaList from '../Scadenza/ScadenzaList';

const FatturaDetails = () => {
    const { id: fatturaId } = useParams();
    const history = useHistory();
    const [fattura, setFattura] = useState(null);
    const [servizi, setServizi] = useState([]);
    const [cliente, setCliente] = useState(null);
    const [scadenza, setScadenza] = useState(null);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showServizioModal, setShowServizioModal] = useState(false);
    const [showScadenzaModal, setShowScadenzaModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');

    const resetViews = () => {
        setShowClienteModal(false);
        setShowServizioModal(false);
        setShowScadenzaModal(false);
        setCliente(null);
        setServizi([]);
        setScadenza(null);
    };

    const fetchFattura = useCallback(async () => {
        try {
            const response = await fatturaApi.getFattura(fatturaId);
            setFattura(response.data);
        } catch (error) {
            console.error('Errore durante il recupero della fattura:', error);
        }
    }, [fatturaId]);

    useEffect(() => {
        if (fatturaId) {
            fetchFattura();
        }
    }, [fatturaId, fetchFattura]);

    const fetchServiziAssociati = async () => {
        resetViews();
        try {
            const response = await fatturaApi.getServizi(fatturaId);
            setServizi(response.data);
        } catch (error) {
            console.error('Errore durante il recupero dei servizi:', error);
        }
    };

    const fetchClienteAssociato = async () => {
        resetViews();
        try {
            const response = await fatturaApi.getCliente(fatturaId);
            setCliente(response.data);
        } catch (error) {
            console.error('Errore durante il recupero del cliente:', error);
        }
    };

    const fetchScadenzaAssociata = async () => {
        resetViews();
        try {
            const response = await fatturaApi.getScadenza(fatturaId);
            setScadenza(response.data);
        } catch (error) {
            console.error('Errore durante il recupero della scadenza:', error);
        }
    };

    const handleSelectCliente = async (clienteId) => {
        try {
            await fatturaApi.associateCliente(fatturaId, clienteId);
            fetchClienteAssociato();
            setShowClienteModal(false);
            setActiveTab('modifica');
        } catch (error) {
            console.error('Errore durante l\'associazione del cliente:', error);
        }
    };

    const handleSelectServizio = async (servizioId) => {
        try {
            await fatturaApi.associateServizio(fatturaId, servizioId);
            fetchServiziAssociati();
            setShowServizioModal(false);
            setActiveTab('modifica');
        } catch (error) {
            console.error('Errore durante l\'associazione del servizio:', error);
        }
    };

    const handleSelectScadenza = async (scadenzaId) => {
        try {
            await fatturaApi.associateScadenza(fatturaId, scadenzaId);
            fetchScadenzaAssociata();
            setShowScadenzaModal(false);
            setActiveTab('modifica');
        } catch (error) {
            console.error('Errore durante l\'associazione della scadenza:', error);
        }
    };

    const handleSaveFattura = async (updatedFattura) => {
        try {
            await fatturaApi.updateFattura(fatturaId, updatedFattura);
            setFattura(updatedFattura);
            setIsEditing(false);
            alert('Fattura aggiornata con successo.');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento della fattura:', error);
        }
    };

    const handleNavigateToCliente = (clienteId) => {
        history.push(`/clienti/${clienteId}`);
    };

    const handleNavigateToServizio = (servizioId) => {
        history.push(`/servizi/${servizioId}`);
    };

    const handleNavigateToScadenza = (scadenzaId) => {
        history.push(`/scadenze/${scadenzaId}`);
    };

    const handleBackClick = () => {
        history.goBack();
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        resetViews();
    };

    if (!fattura) {
        return <div>Seleziona una fattura per vedere i dettagli...</div>;
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
                                { id: 'scadenza', label: 'Scadenza' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {activeTab === 'cliente' && (
                            <div className="cliente-box">
                                <button onClick={fetchClienteAssociato} className="btn btn-show-cliente">
                                    Visualizza Cliente
                                </button>
                                <button onClick={() => setShowClienteModal(true)} className="btn btn-associate-cliente">
                                    Associa Cliente
                                </button>
                            </div>
                        )}
                        {activeTab === 'servizi' && (
                            <div className="servizi-box">
                                <button onClick={fetchServiziAssociati} className="btn btn-show-servizi">
                                    Visualizza Servizi
                                </button>
                                <button onClick={() => setShowServizioModal(true)} className="btn btn-associate-servizio">
                                    Associa Servizio
                                </button>
                            </div>
                        )}
                        {activeTab === 'scadenza' && (
                            <div className="scadenza-box">
                                <button onClick={fetchScadenzaAssociata} className="btn btn-show-scadenza">
                                    Visualizza Scadenza
                                </button>
                                <button onClick={() => setShowScadenzaModal(true)} className="btn btn-associate-scadenza">
                                    Associa Scadenza
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={handleBackClick} className="btn btn-back">Indietro</button>
            </div>
            {servizi.length > 0 && (
                <div className="servizi-section">
                    <h3>Servizi Associati</h3>
                    <table className="servizi-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Valore</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servizi.map((servizio) => (
                                <tr key={servizio._id}>
                                    <td>{servizio.descrizione}</td>
                                    <td>{servizio.valore_unitario}</td>
                                    <td>
                                        <button
                                            onClick={() => handleNavigateToServizio(servizio._id)}
                                            className="btn btn-open"
                                        >
                                            Apri
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {cliente && (
                <table className="cliente-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Cognome</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{cliente.nome}</td>
                            <td>{cliente.cognome}</td>
                            <td>
                                <button
                                    onClick={() => handleNavigateToCliente(cliente._id)}
                                    className="btn btn-open"
                                >
                                    Apri
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
            {scadenza && (
                <table className="scadenza-table">
                    <thead>
                        <tr>
                            <th>Scadenza</th>
                            <th>Cliente</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{new Date(scadenza.scadenza).toLocaleDateString()}</td>
                            <td>{`${scadenza.nome} ${scadenza.cognome}`}</td>
                            <td>
                                <button
                                    onClick={() => handleNavigateToScadenza(scadenza._id)}
                                    className="btn btn-open"
                                >
                                    Apri
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
            {showClienteModal && (
                <ClienteList onSelectCliente={handleSelectCliente} />
            )}
            {showServizioModal && (
                <ServizioList onSelectServizio={handleSelectServizio} />
            )}
            {showScadenzaModal && (
                <ScadenzaList onSelectScadenza={handleSelectScadenza} />
            )}
        </div>
    );
};

export default FatturaDetails;
