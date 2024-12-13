import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import clienteApi from '../../api/clienteApi';
import contatoreApi from '../../api/contatoreApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Cliente/ClienteDetails.css';
import ContatoreEditor from '../shared/ContatoreEditor'


const ClienteDetails= () => 
{
    const { id: clienteId } = useParams(); // Dynamically fetch clienteId from route params
    const history = useHistory();
    const [cliente, setCliente] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [fatture, setFatture] = useState([]);
    const [showContatori, setShowContatori] = useState(false);
    const [showFatture, setShowFatture] = useState(false);
    const [showContatoreModal, setShowContatoreModal] = useState(false);
    const [showFatturaModal, setShowFatturaModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editingContatore, setEditingContatore] = useState(null);
    const [creatingContatore, setCreatingContatore] = useState(false);

    useEffect(() =>
    {
        const fetchCliente = async () =>
        {
            try
            {
                const response = await clienteApi.getCliente(clienteId);
                setCliente(response.data);
                setEditFormData(response.data);
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

    const handleEditContatore = (contatore) => {
        setEditingContatore(contatore);
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
            await clienteApi.updateCliente(clienteId, editFormData);
            setCliente(editFormData);
            setIsEditing(false);
            alert('Cliente aggiornato con successo');
        }
        catch (error)
        {
            alert('Errore durante l\'aggiornamento del cliente');
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
                <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Ragione Sociale:</label>
                        <input type="text" name="ragione_sociale" value={editFormData.ragione_sociale || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Nome:</label>
                        <input type="text" name="nome" value={editFormData.nome || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Cognome:</label>
                        <input type="text" name="cognome" value={editFormData.cognome || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Sesso:</label>
                        <input type="text" name="sesso" value={editFormData.sesso || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Socio:</label>
                        <input type="checkbox" name="socio" checked={editFormData.socio || false} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Data di Nascita:</label>
                        <input type="date" name="data_nascita" value={editFormData.data_nascita ? editFormData.data_nascita.split('T')[0] : ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Comune di Nascita:</label>
                        <input type="text" name="comune_nascita" value={editFormData.comune_nascita || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Provincia di Nascita:</label>
                        <input type="text" name="provincia_nascita" value={editFormData.provincia_nascita || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Indirizzo di Residenza:</label>
                        <input type="text" name="indirizzo_residenza" value={editFormData.indirizzo_residenza || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Numero di Residenza:</label>
                        <input type="text" name="numero_residenza" value={editFormData.numero_residenza || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>CAP di Residenza:</label>
                        <input type="text" name="cap_residenza" value={editFormData.cap_residenza || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Località di Residenza:</label>
                        <input type="text" name="localita_residenza" value={editFormData.localita_residenza || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Provincia di Residenza:</label>
                        <input type="text" name="provincia_residenza" value={editFormData.provincia_residenza || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Nazione di Residenza:</label>
                        <input type="text" name="nazione_residenza" value={editFormData.nazione_residenza || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Destinazione di Fatturazione:</label>
                        <input type="text" name="destinazione_fatturazione" value={editFormData.destinazione_fatturazione || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Indirizzo di Fatturazione:</label>
                        <input type="text" name="indirizzo_fatturazione" value={editFormData.indirizzo_fatturazione || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Numero di Fatturazione:</label>
                        <input type="text" name="numero_fatturazione" value={editFormData.numero_fatturazione || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>CAP di Fatturazione:</label>
                        <input type="text" name="cap_fatturazione" value={editFormData.cap_fatturazione || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Località di Fatturazione:</label>
                        <input type="text" name="localita_fatturazione" value={editFormData.localita_fatturazione || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Provincia di Fatturazione:</label>
                        <input type="text" name="provincia_fatturazione" value={editFormData.provincia_fatturazione || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Nazione di Fatturazione:</label>
                        <input type="text" name="nazione_fatturazione" value={editFormData.nazione_fatturazione || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Codice Fiscale:</label>
                        <input type="text" name="codice_fiscale" value={editFormData.codice_fiscale || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Telefono:</label>
                        <input type="text" name="telefono" value={editFormData.telefono || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" name="email" value={editFormData.email || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Pagamento:</label>
                        <input type="text" name="pagamento" value={editFormData.pagamento || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Codice Destinatario:</label>
                        <input type="text" name="codice_destinatario" value={editFormData.codice_destinatario || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Fattura Elettronica:</label>
                        <input type="checkbox" name="fattura_elettronica" checked={editFormData.fattura_elettronica || false} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Codice ERP:</label>
                        <input type="text" name="codice_cliente_erp" value={editFormData.codice_cliente_erp || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>IBAN:</label>
                        <input type="text" name="iban" value={editFormData.iban || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Note:</label>
                        <textarea name="note" value={editFormData.note || ''} onChange={handleEditChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Quote:</label>
                        <input type="number" name="quote" value={editFormData.quote || ''} onChange={handleEditChange} />
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
                    <div className="btn-container">
                        <button onClick={fetchContatori} className="btn btn-show-contatori">Visualizza Contatori</button>
                        <button onClick={() => setCreatingContatore(true)} className="btn btn-create-contatore">Crea Contatore</button>
                        <button onClick={fetchFatture} className="btn btn-show-fatture">Visualizza Fatture</button>
                        <button onClick={handleOpenContatoreModal} className="btn btn-associate-contatore">Associa Contatore</button>
                        <button onClick={handleOpenFatturaModal} className="btn btn-associate-fattura">Associa Fattura</button>
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
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
                                            onClick={() => handleEditContatore(contatore)}
                                        >
                                            Modifica
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
                    mode="Modifica" // "Nuovo", "Visualizza", or "Modifica"
                />
            )}
            {creatingContatore && (
                <ContatoreEditor
                    contatore={{}}
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
