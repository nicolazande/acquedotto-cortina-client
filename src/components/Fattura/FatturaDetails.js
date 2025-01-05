import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import fatturaApi from '../../api/fatturaApi';
import clienteApi from '../../api/clienteApi';
import servizioApi from '../../api/servizioApi';
import scadenzaApi from '../../api/scadenzaApi';
import '../../styles/Fattura/FatturaDetails.css';
import FatturaEditor from '../shared/FatturaEditor';
import ClienteList from '../Cliente/ClienteList';
import ClienteEditor from '../shared/ClienteEditor';
import ServizioList from '../Servizio/ServizioList';
import ServizioEditor from '../shared/ServizioEditor';
import ScadenzaList from '../Scadenza/ScadenzaList';
import ScadenzaEditor from '../shared/ScadenzaEditor';


const FatturaDetails = () => {
    const { id: fatturaId } = useParams();
    const history = useHistory();
    const [fattura, setFattura] = useState(null);
    const [servizi, setServizi] = useState([]);
    const [showServizi, setShowServizi] = useState(false);
    const [associatingServizio, setAssociatingServizio] = useState(false);
    const [creatingServizio, setCreatingServizio] = useState(false);
    const [cliente, setCliente] = useState([]);
    const [showCliente, setShowCliente] = useState(false);
    const [associatingCliente, setAssociatingCliente] = useState(false);
    const [creatingCliente, setCreatingCliente] = useState(false);
    const [scadenza, setScadenza] = useState(null);
    const [showScadenza, setShowScadenza] = useState(false);
    const [associatingScadenza, setAssociatingScadenza] = useState(false);
    const [creatingScadenza, setCreatingScadenza] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');

    const resetViews = () => {
        setCliente(null);
        setShowCliente(false);
        setAssociatingCliente(false);
        setCreatingCliente(false);
        setServizi([]);
        setShowServizi(false);
        setAssociatingServizio(false);
        setCreatingServizio(false);
        setScadenza([]);
        setShowScadenza(false);
        setAssociatingScadenza(false);
        setCreatingScadenza(false);
    };

    const fetchFattura = useCallback(async () => {
        try {
            const response = await fatturaApi.getFattura(fatturaId);
            setFattura(response.data);
            resetViews();
        } catch (error) {
            console.error('Errore durante il recupero della fattura:', error);
        }
    }, [fatturaId]);

    const handleEditFattura = async (updatedFattura) => {
        try {
            await fatturaApi.updateFattura(fatturaId, updatedFattura);
            setFattura(updatedFattura);
            setIsEditing(false);
            alert('Fattura aggiornata con successo.');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento della fattura:', error);
        }
    };

    const handleDeleteFattura = async () => {
        try {
            if (window.confirm('Sei sicuro di voler cancellare questa fattura?')) {
                await fatturaApi.deleteFattura(fatturaId);
                alert('Fattura cancellata con successo');
                handleBackClick();
            }
        } catch (error) {
            alert('Errore durante la cancellazione della fattura');
            console.error(error);
        }
    };    

    const fetchServizi = async () => {
        try {
            const response = await fatturaApi.getServizi(fatturaId);
            setServizi(response.data);
            setShowServizi(true);
        } catch (error) {
            console.error('Errore durante il recupero dei servizi:', error);
        }
    };

    const handleAssociateServizio = async (servizioId) => {
        try {
            await fatturaApi.associateServizio(fatturaId, servizioId);
            alert('Servizio associato con successo');
            setAssociatingServizio(false);
            fetchServizi();
        } catch (error) {
            alert("Errore durante l'associazione del contatore");
            console.error(error);
        }
    };

    const handleCreateServizio = async (newServizio) => {
        try {
            const response = await servizioApi.createServizio(newServizio);
            await fatturaApi.associateServizio(fatturaId, response.data._id);
            alert('Servizio creato e associato con successo');
            setCreatingServizio(false);
            fetchServizi();
        } catch (error) {
            alert('Errore durante la creazione o associazione del servizio');
            console.error(error);
        }
    };

    const fetchCliente = async () => {
        try {
            const response = await fatturaApi.getCliente(fatturaId);
            setCliente(response.data);
            setShowCliente(true);
        } catch (error) {
            console.error('Errore durante il recupero del cliente:', error);
            alert('Errore durante il recupero del cliente associato.');

        }
    };

    const handleAssociateCliente = async (clienteId) => {
        try {
            await fatturaApi.associateCliente(fatturaId, clienteId);
            alert('Cliente associato con successo.');
            setAssociatingCliente(false);
            fetchCliente();
        } catch (error) {
            console.error('Errore durante l\'associazione del cliente:', error);
            alert('Errore durante l\'associazione del cliente.');
        }
    };

    const handleCreateCliente = async (newCliente) => {
        try {
            const response = await clienteApi.createCliente(newCliente);
            await fatturaApi.associateCliente(fatturaId, response.data._id);
            alert('Cliente creato e associato con successo');
            setCreatingCliente(false);
            fetchCliente();
        } catch (error) {
            alert('Errore durante la creazione o associazione del cliente');
            console.error(error);
        }
    };

    const fetchScadenza = async () => {
        try {
            const response = await fatturaApi.getScadenza(fatturaId);
            setScadenza(response.data);
            setShowScadenza(true);
        } catch (error) {
            console.error('Errore durante il recupero della scadenza:', error);
            alert('Errore durante il recupero della scadenza associata.');

        }
    };

    const handleAssociateScadenza = async (scadenzaId) => {
        try {
            await fatturaApi.associateScadenza(fatturaId, scadenzaId);
            alert('Scadenza associata con successo.');
            setAssociatingScadenza(false);
            fetchScadenza();
        } catch (error) {
            console.error('Errore durante l\'associazione della scadenza:', error);
            alert('Errore durante l\'associazione della scadenza.');
        }
    };

    const handleCreateScadenza = async (newScadenza) => {
        try {
            const response = await scadenzaApi.createScadenza(newScadenza);
            await fatturaApi.associateScadenza(fatturaId, response.data._id);
            alert('Scadenza creata e associato con successo');
            setCreatingScadenza(false);
            fetchScadenza();
        } catch (error) {
            alert('Errore durante la creazione o associazione della scadenza');
            console.error(error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        resetViews();
    };

    const handleBackClick = () => {
        history.goBack();
    };

    useEffect(() => {
        resetViews();
        if (fatturaId) fetchFattura();
    }, [fatturaId, fetchFattura]);

    if (!fattura) {
        return <div>Seleziona una fattura per vedere i dettagli...</div>;
    }

    return (
        <div className="fattura-details">
            <h2>Dettagli Fattura</h2>
            {isEditing ? (
                <FatturaEditor
                    fattura={fattura}
                    onSave={handleEditFattura}
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
                            <button onClick={handleDeleteFattura} className="btn btn-delete">
                                Cancella
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
                                    <th>Confermata</th>
                                    <td>
                                        <input type="checkbox" checked={fattura.confermata} readOnly />
                                    </td>
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
                                    <th>Data Fattura</th>
                                    <td>{fattura.data_fattura ? new Date(fattura.data_fattura).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                
                                <tr>
                                    <th>Codice</th>
                                    <td>{fattura.codice || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Destinazione</th>
                                    <td>{fattura.destinazione || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Imponibile</th>
                                    <td>{fattura.imponibile || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>IVA</th>
                                    <td>{fattura.iva || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Sconto imponibile</th>
                                    <td>{fattura.sconto_imponibile || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Totale fattura</th>
                                    <td>{fattura.totale_fattura || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Data fattura elettronica</th>
                                    <td>{fattura.data_fattura_elettronica  ? new Date(fattura.data_fattura_elettronica ).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Data invio fattura</th>
                                    <td>{fattura.data_invio_fattura  ? new Date(fattura.data_invio_fattura ).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Tipo pagamento</th>
                                    <td>{fattura.tipo_pagamento || 'N/A'}</td>
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
                                <button onClick={fetchCliente} className="btn btn-show-cliente">
                                    Visualizza Cliente
                                </button>
                                <button onClick={() => setAssociatingCliente(true)} className="btn btn-associate-cliente">
                                    Associa Cliente
                                </button>
                                <button onClick={() => setCreatingCliente(true)} className="btn btn-create-cliente">
                                    Crea Cliente
                                </button>
                            </div>
                        )}
                        {activeTab === 'servizi' && (
                            <div className="servizi-box">
                                <button
                                    onClick={fetchServizi}
                                    className="btn btn-view-servizi"
                                >
                                    Visualizza Servizi
                                </button>
                                <button onClick={() => setAssociatingServizio(true)} className="btn btn-associate-servizio">
                                    Associa Servizio
                                </button>
                                <button onClick={() => setCreatingServizio(true)} className="btn btn-create-servizio">
                                    Nuovo Servizio
                                </button>
                            </div>
                        )}
                        {activeTab === 'scadenza' && (
                            <div className="scadenza-box">
                                <button onClick={fetchScadenza} className="btn btn-show-scadenza">
                                    Visualizza Scadenza
                                </button>
                                <button onClick={() => setAssociatingScadenza(true)} className="btn btn-associate-scadenza">
                                    Associa Scadenza
                                </button>
                                <button onClick={() => setCreatingScadenza(true)} className="btn btn-create-scadenza">
                                    Nuova Scadenza
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="btn-back-container">
                <button onClick={handleBackClick} className="btn btn-back">Indietro</button>
            </div>

            {showServizi && Array.isArray(servizi) && servizi.length > 0 && (
                <div className="contatori-section">
                    <h3>Servizi Associati</h3>
                    <table className="servizi-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Data Lettura</th>
                                <th>Valore unitario</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servizi.map((servizio) => (
                                <tr key={servizio._id}>
                                    <td>{servizio.descrizione}</td>
                                    <td>{new Date(servizio.data_lettura).toLocaleDateString()}</td>
                                    <td>{servizio.valore_unitario.toFixed(2)} €</td>
                                    <td>
                                        <button
                                            className="btn btn-edit"
                                            onClick={() => history.push(`/servizi/${servizio._id}`)}
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
            {associatingServizio && (
                <ServizioList
                    onSelectServizio={handleAssociateServizio}
                />
            )}
            {creatingServizio && (
                <ServizioEditor
                    servizio={{
                        fattura: fattura._id,
                    }}
                    onSave={handleCreateServizio}
                    onCancel={() => setCreatingServizio(false)}
                    mode="Nuovo"
                />
            )}
            {showCliente && cliente && (
                <div className="cliente-section">
                    <h3>Cliente Associato</h3>
                    <table className="cliente-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Cognome</th>
                                <th>Nascita</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{cliente.nome}</td>
                                <td>{cliente.cognome}</td>
                                <td>{cliente.data_nascita ? new Date(cliente.data_nascita).toLocaleDateString() : '-'}</td>
                                <td>
                                    <button
                                        onClick={() => history.push(`/clienti/${cliente._id}`)}
                                        className="btn btn-open"
                                    >
                                        Apri
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {associatingCliente && (
                <ClienteList
                    onSelectCliente={handleAssociateCliente}
                />
            )}
            {creatingCliente && (
                <ClienteEditor
                    onSave={handleCreateCliente}
                    onCancel={() => setCreatingCliente(false)}
                    mode="Nuovo"
                />
            )}
            {showScadenza && scadenza && (
                <div className="letture-section">
                    <h3>Scadenza Associata</h3>
                    <table className="scadenza-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Cognome</th>
                                <th>Scadenza</th>
                                <th>Ritardo</th>
                                <th>Totale</th>
                                <th>Saldo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td>{scadenza.nome}</td>
                                    <td>{scadenza.cognome}</td>
                                    <td>{scadenza.scadenza ? new Date(scadenza.scadenza).toLocaleDateString() : 'N/A'}</td>
                                    <td>{scadenza.ritardo} giorni</td>
                                    <td>{scadenza.totale.toFixed(2)} €</td>
                                    <td>
                                        <input type="checkbox" checked={scadenza.saldo} readOnly />
                                    </td>
                                <td>
                                    <button
                                        onClick={() => history.push(`/scadenze/${scadenza._id}`)}
                                        className="btn btn-open"
                                    >
                                        Apri
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {associatingScadenza && (
                <ScadenzaList
                    onSelectScadenza={handleAssociateScadenza}
                />
            )}
            {creatingScadenza && (
                <ScadenzaEditor
                    onSave={handleCreateScadenza}
                    onCancel={() => setCreatingScadenza(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default FatturaDetails;
