import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import clienteApi from '../../api/clienteApi';
import contatoreApi from '../../api/contatoreApi';
import fatturaApi from '../../api/fatturaApi';
import ContatoreEditor from '../shared/ContatoreEditor'
import ClienteEditor from '../shared/ClienteEditor'
import ContatoreList from '../Contatore/ContatoreList';
import FatturaList from '../Fattura/FatturaList';
import FatturaEditor from '../shared/FatturaEditor';

import '../../styles/Cliente/ClienteDetails.css';


const ClienteDetails= () => 
{
    const { id: clienteId } = useParams();
    const history = useHistory();
    const [cliente, setCliente] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [showContatori, setShowContatori] = useState(false);
    const [associatingContatore, setAssociatingContatore] = useState(false);
    const [creatingContatore, setCreatingContatore] = useState(false);
    const [fatture, setFatture] = useState([]);
    const [showFatture, setShowFatture] = useState(false);
    const [associatingFattura, setAssociatingFattura] = useState(false);
    const [creatingFattura, setCreatingFattura] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');
    

    const resetViews = () => {
        setShowContatori(false);
        setAssociatingContatore(false);
        setCreatingContatore(false);
        setShowFatture(false);
        setAssociatingFattura(false);
        setCreatingFattura(false);
        setContatori([]);
        setFatture([]);
    };
    
    const fetchCliente = useCallback(async () => {
        try
        {
            const response = await clienteApi.getCliente(clienteId);
            setCliente(response.data);
            resetViews();
        }
        catch (error)
        {
            alert('Errore durante il recupero del cliente');
            console.error(error);
        }
    }, [clienteId]);

    const handleEditCliente = async (updatedCliente) => {
        try {
            await clienteApi.updateCliente(clienteId, updatedCliente);
            setCliente(updatedCliente);
            setIsEditing(false);
            alert('Cliente aggiornato con successo');
        } catch (error) {
            alert('Errore durante l\'aggiornamento del cliente');
            console.error(error);
        }
    };

    const handleDeleteCliente = async () => {
        try {
            if (window.confirm('Sei sicuro di voler cancellare questo cliente?')) {
                await clienteApi.deleteCliente(clienteId);
                alert('Cliente cancellato con successo');
                handleBackClick();
            }
        } catch (error) {
            alert('Errore durante la cancellazione del cliente');
            console.error(error);
        }
    };    

    const fetchContatori = async () =>
    {
        try
        {
            const response = await clienteApi.getContatori(clienteId);
            setContatori(response.data);
            setShowContatori(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleAssociaContatore = async (contatoreId) => {
        try {
            await clienteApi.associateContatore(clienteId, contatoreId);
            alert('Contatore associato con successo.');
            setAssociatingContatore(false);
        } catch (error) {
            console.error('Errore durante l\'associazione del contatore:', error);
            alert('Errore durante l\'associazione del contatore.');
        }
    };

    const handleCreateContatore = async (newContatore) => {
        try {
            const response = await contatoreApi.createContatore(newContatore);
            await clienteApi.associateContatore(clienteId, response.data._id);
            alert('Contatore creato e associato con successo');
            setCreatingContatore(false);
            fetchContatori();
        } catch (error) {
            alert('Errore durante la creazione o associazione del contatore');
            console.error(error);
        }
    };

    const fetchFatture = async () =>
    {
        try
        {
            const response = await clienteApi.getFatture(clienteId);
            setFatture(response.data);
            setShowFatture(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero delle fatture');
            console.error(error);
        }
    };

    const handleAssociaFattura = async (fatturaId) =>
    {
        try
        {
            await clienteApi.associateFattura(clienteId, fatturaId);
            alert('Fattura associata con successo.');
            setAssociatingFattura(false);
            fetchFatture();
        }
        catch (error)
        {
            alert('Errore durante l\'associazione della fattura');
            console.error(error);
        }
    };

    const handleCreateFattura = async (newFattura) => {
        try {
            const response = await fatturaApi.createFattura(newFattura);
            await clienteApi.associateFattura(clienteId, response.data._id);
            alert('Fattura creata e associata con successo');
            setCreatingFattura(false);
            fetchFatture();
        } catch (error) {
            alert('Errore durante la creazione o associazione della fattura');
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
        if (clienteId) fetchCliente();
    }, [clienteId, fetchCliente]);

    if (!cliente)
    {
        return <div>Seleziona un cliente per vedere i dettagli</div>;
    }

    return (
        <div className="cliente-details">
            <h2>Dettagli Cliente</h2>
            {isEditing ? (
                <ClienteEditor
                    cliente={cliente}
                    onSave={handleEditCliente}
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
                            <button onClick={handleDeleteCliente} className="btn btn-delete">
                                Cancella
                            </button>
                        </div>
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Ragione Sociale</th>
                                    <td>{cliente.ragione_sociale || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Nome</th>
                                    <td>{cliente.nome || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Cognome</th>
                                    <td>{cliente.cognome || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Sesso</th>
                                    <td>{cliente.sesso || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Socio</th>
                                    <td>{cliente.socio ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Quote</th>
                                    <td>{cliente.quote || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Data di Nascita</th>
                                    <td>{cliente.data_nascita ? new Date(cliente.data_nascita).toLocaleDateString() : '-'}</td>
                                </tr>
                                <tr>
                                    <th>Comune di Nascita</th>
                                    <td>{cliente.comune_nascita || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Provincia di Nascita</th>
                                    <td>{cliente.provincia_nascita || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Indirizzo di Residenza</th>
                                    <td>{cliente.indirizzo_residenza || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Numero di Residenza</th>
                                    <td>{cliente.numero_residenza || '-'}</td>
                                </tr>
                                <tr>
                                    <th>CAP di Residenza</th>
                                    <td>{cliente.cap_residenza || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Località di Residenza</th>
                                    <td>{cliente.localita_residenza || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Provincia di Residenza</th>
                                    <td>{cliente.provincia_residenza || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Nazione di Residenza</th>
                                    <td>{cliente.nazione_residenza || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Destinazione di Fatturazione</th>
                                    <td>{cliente.destinazione_fatturazione || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Indirizzo di Fatturazione</th>
                                    <td>{cliente.indirizzo_fatturazione || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Numero di Fatturazione</th>
                                    <td>{cliente.numero_fatturazione || '-'}</td>
                                </tr>
                                <tr>
                                    <th>CAP di Fatturazione</th>
                                    <td>{cliente.cap_fatturazione || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Località di Fatturazione</th>
                                    <td>{cliente.localita_fatturazione || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Provincia di Fatturazione</th>
                                    <td>{cliente.provincia_fatturazione || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Nazione di Fatturazione</th>
                                    <td>{cliente.nazione_fatturazione || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Codice Fiscale</th>
                                    <td>{cliente.codice_fiscale || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Partita IVA</th>
                                    <td>{cliente.partita_iva || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Telefono</th>
                                    <td>{cliente.telefono || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Cellulare</th>
                                    <td>{cliente.cellulare || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Cellulare 2</th>
                                    <td>{cliente.cellulare2 || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Email</th>
                                    <td>{cliente.email || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Pagamento</th>
                                    <td>{cliente.pagamento || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Data Mandato SDD</th>
                                    <td>{cliente.data_mandato_sdd ? new Date(cliente.data_mandato_sdd).toLocaleDateString() : '-'}</td>
                                </tr>
                                <tr>
                                    <th>Email PEC</th>
                                    <td>{cliente.email_pec || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Codice Destinatario</th>
                                    <td>{cliente.codice_destinatario || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Fattura Elettronica</th>
                                    <td>{cliente.fattura_elettronica ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Codice ERP</th>
                                    <td>{cliente.codice_cliente_erp || '-'}</td>
                                </tr>
                                <tr>
                                    <th>IBAN</th>
                                    <td>{cliente.iban || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Note</th>
                                    <td>{cliente.note || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tabs-container">
                        {/* Tab Navigation */}
                        <div className="tabs">
                            {[
                                { id: 'contatori', label: 'Contatori' },
                                { id: 'fatture', label: 'Fatture' },
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
                        {/* Tab Content */}
                        <div className={`tab-content ${activeTab === 'contatori' ? 'show' : ''}`}>
                            {activeTab === 'contatori' && (
                                <div className="contatori-box">
                                    <button onClick={fetchContatori} className="btn btn-show-contatori">
                                        Visualizza Contatori
                                    </button>
                                    <button onClick={() => setAssociatingContatore(true)} className="btn btn-associate-contatore">
                                        Associa Contatore
                                    </button>
                                    <button onClick={() => setCreatingContatore(true)} className="btn btn-create-contatore">
                                        Crea Contatore
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={`tab-content ${activeTab === 'fatture' ? 'show' : ''}`}>
                            {activeTab === 'fatture' && (
                                <div className="fatture-box">
                                    <button onClick={fetchFatture} className="btn btn-show-fatture">
                                        Visualizza Fatture
                                    </button>
                                    <button onClick={() => setAssociatingFattura(true)} className="btn btn-associate-fattura">
                                        Associa Fattura
                                    </button>
                                    <button onClick={() => setCreatingFattura(true)} className="btn btn-create-contatore">
                                        Crea Fattura
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

            {showContatori && Array.isArray(contatori) && contatori.length > 0 && (
                <div className="contatori-section">
                    <h3>Contatori Associati</h3>
                    <table className="contatori-table">
                        <thead>
                            <tr>
                                <th>Seriale</th>
                                <th>Seriale Interno</th>
                                <th>Edificio</th>
                                <th>Inattivo</th>
                                <th>Condominiale</th>
                                <th>Sostituzione</th>
                                <th>Subentro</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                contatori.map((contatore) => (
                                <tr key={contatore._id}>
                                    <td>{contatore.seriale}</td>
                                    <td>{contatore.seriale_interno}</td>
                                    <td>{contatore.nome_edificio}</td>
                                    <td><input type="checkbox" checked={contatore.inattivo} readOnly /></td>
                                    <td><input type="checkbox" checked={contatore.condominiale} readOnly /></td>
                                    <td><input type="checkbox" checked={contatore.sostituzione} readOnly /></td>
                                    <td><input type="checkbox" checked={contatore.subentro} readOnly /></td>
                                    <td>
                                        <button
                                            className="btn btn-edit"
                                            onClick={() => history.push(`/contatori/${contatore._id}`)}
                                        >
                                        Apri
                                        </button>
                                    </td>
                                </tr>))
                            }
                        </tbody>
                    </table>
                </div>
            )}
            {associatingContatore && (
                <ContatoreList
                    onSelectContatore={handleAssociaContatore}
                />
            )}
            {creatingContatore && (
                <ContatoreEditor
                    contatore={{
                        nome_cliente: `${cliente.nome || ''} ${cliente.cognome || ''}`.trim(),
                        cliente: cliente._id,
                    }}
                    onSave={handleCreateContatore}
                    onCancel={() => setCreatingContatore(false)}
                    mode="Nuovo"
                />
            )}
            {showFatture && Array.isArray(fatture) && fatture.length > 0 && (
                <div className="fatture-section">
                    <h3>Fatture Associate</h3>
                    <table className="fatture-table">
                        <thead>
                            <tr>
                                <th>Ragione Sociale</th>
                                <th>Anno</th>
                                <th>Numero</th>
                                <th>Data</th>
                                <th>Confermata</th>
                                <th>Codice</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                fatture.map((fattura) => (
                                    <tr key={fattura._id}>
                                        <td>{fattura.ragione_sociale}</td>
                                        <td>{fattura.anno}</td>
                                        <td>{fattura.numero}</td>
                                        <td>{new Date(fattura.data_fattura).toLocaleDateString()}</td>
                                        <td><input type="checkbox" checked={fattura.confermata} readOnly /></td>
                                        <td>{fattura.codice}</td>
                                        <td>
                                            <button
                                                className="btn btn-edit"
                                                onClick={() => history.push(`/fatture/${fattura._id}`)}
                                            >
                                            Apri
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            )}
            {associatingFattura && (
                <FatturaList
                    onSelectFattura={handleAssociaFattura}
                />
            )}
            {creatingFattura && (
                <FatturaEditor
                    fattura={{
                        cliente: cliente._id,
                        ragione_sociale: `${cliente.nome || ''} ${cliente.cognome || ''}`.trim(),
                    }}
                    onSave={handleCreateFattura}
                    onCancel={() => setCreatingFattura(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default ClienteDetails;
