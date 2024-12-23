import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import clienteApi from '../../api/clienteApi';
import contatoreApi from '../../api/contatoreApi';
import fatturaApi from '../../api/fatturaApi';
import ContatoreEditor from '../shared/ContatoreEditor'
import ClienteEditor from '../shared/ClienteEditor'
import '../../styles/Cliente/ClienteDetails.css';


const ClienteDetails= () => 
{
    const { id: clienteId } = useParams();
    const history = useHistory();
    const [cliente, setCliente] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [fatture, setFatture] = useState([]);
    const [showContatori, setShowContatori] = useState(false);
    const [showFatture, setShowFatture] = useState(false);
    const [showContatoreModal, setShowContatoreModal] = useState(false);
    const [showFatturaModal, setShowFatturaModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingContatore, setEditingContatore] = useState(null);
    const [creatingContatore, setCreatingContatore] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');

    useEffect(() =>
    {
        const fetchCliente = async () =>
        {
            try
            {
                const response = await clienteApi.getCliente(clienteId);
                setCliente(response.data);
                setShowContatori(false);
                setShowFatture(false);
            }
            catch (error)
            {
                alert('Errore durante il recupero del cliente');
                console.error(error);
            }
        };

        if (clienteId)
        {
            fetchCliente();
        }

        setShowContatoreModal(false);
        setShowFatturaModal(false);
    }, [clienteId]);

    const fetchContatori = async () =>
    {
        try
        {
            const response = await clienteApi.getContatori(clienteId);
            setContatori(response.data);
            setShowContatori(true);
            setShowFatture(false);
        }
        catch (error)
        {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleSaveCliente = async (updatedCliente) => {
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

    const handleBackClick = () => {
        history.goBack(); // Adjust the route as per your Clienti list URL
    };

    const handleCreateContatore = async (newContatore) => {
        try {
            // Create the new contatore
            const response = await contatoreApi.createContatore(newContatore);

            // Associate the new contatore with the current cliente
            await clienteApi.associateContatore(clienteId, response.data._id);

            alert('Contatore creato e associato con successo');
            setCreatingContatore(false);
            fetchContatori();
        } catch (error) {
            alert('Errore durante la creazione o associazione del contatore');
            console.error(error);
        }
    };

    const handleSaveContatore = async (updatedContatore) => {
        try {
            await contatoreApi.updateContatore(updatedContatore._id, updatedContatore);
            alert('Contatore aggiornato con successo');
            setEditingContatore(null);
            fetchContatori();
        } catch (error) {
            alert('Errore durante l\'aggiornamento del contatore');
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
            setShowContatori(false);
        }
        catch (error)
        {
            alert('Errore durante il recupero delle fatture');
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
            setShowFatturaModal(false);
        }
        catch (error)
        {
            alert('Errore durante il recupero dei contatori');
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
            setShowContatoreModal(false);
        } 
        catch (error)
        {
            alert('Errore durante il recupero delle fatture');
            console.error(error);
        }
    };

    const handleSelectContatore = async (contatoreId) =>
    {
        try
        {
            await clienteApi.associateContatore(clienteId, contatoreId);
            setShowContatoreModal(false);
            fetchContatori();
        }
        catch (error)
        {
            alert('Errore durante l\'associazione del contatore');
            console.error(error);
        }
    };

    const handleSelectFattura = async (fatturaId) =>
    {
        try
        {
            await clienteApi.associateFattura(clienteId, fatturaId);
            setShowFatturaModal(false);
            fetchFatture();
        }
        catch (error)
        {
            alert('Errore durante l\'associazione della fattura');
            console.error(error);
        }
    };

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
                    onSave={handleSaveCliente}
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
                                    onClick={() => setActiveTab(tab.id)}
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
                                    <button onClick={() => setCreatingContatore(true)} className="btn btn-create-contatore">
                                        Crea Contatore
                                    </button>
                                    <button onClick={handleOpenContatoreModal} className="btn btn-associate-contatore">
                                        Associa Contatore
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
                                    <button onClick={handleOpenFatturaModal} className="btn btn-associate-fattura">
                                        Associa Fattura
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
            
            {showContatori && (
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
                            {contatori.length === 0 ? (
                                <tr>
                                    <td colSpan="8">Nessun contatore associato</td>
                                </tr>
                            ) : (
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
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {showFatture && (
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
                            </tr>
                        </thead>
                        <tbody>
                            {fatture.length === 0 ? (
                                <tr>
                                    <td colSpan="8">Nessuna fattura associata</td>
                                </tr>
                            ) : (
                                fatture.map((fattura) => (
                                <tr key={fattura._id}>
                                    <td>{fattura.ragione_sociale}</td>
                                    <td>{fattura.anno}</td>
                                    <td>{fattura.numero}</td>
                                    <td>{new Date(fattura.data_fattura).toLocaleDateString()}</td>
                                    <td><input type="checkbox" checked={fattura.confermata} readOnly /></td>
                                    <td>{fattura.codice}</td>
                                </tr>))
                            )}
                        </tbody>
                    </table>
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
                    </div>
                </div>
            )}
            {editingContatore && (
                <ContatoreEditor
                    contatore={editingContatore}
                    onSave={handleSaveContatore}
                    onCancel={() => setEditingContatore(null)}
                    mode="Modifica"
                />
            )}
            {creatingContatore && (
                <ContatoreEditor
                    contatore={{
                        nome_cliente: `${cliente.nome || ''} ${cliente.cognome || ''}`.trim(),
                    }}
                    onSave={handleCreateContatore}
                    onCancel={() => setCreatingContatore(false)}
                    mode="Nuovo"
                />
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClienteDetails;
