import React, { useEffect, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import contatoreApi from '../../api/contatoreApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Cliente/ClienteDetails.css';

const ClienteDetails = ({ clienteId, onDeselectCliente }) =>
{
    const [cliente, setCliente] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [fatture, setFatture] = useState([]);
    const [showContatori, setShowContatori] = useState(false);
    const [showFatture, setShowFatture] = useState(false);
    const [showContatoreModal, setShowContatoreModal] = useState(false);
    const [showFatturaModal, setShowFatturaModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

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
                        <input type="text" name="ragioneSociale" value={editFormData.ragioneSociale} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Nome:</label>
                        <input type="text" name="nome" value={editFormData.nome} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Cognome:</label>
                        <input type="text" name="cognome" value={editFormData.cognome} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Sesso:</label>
                        <input type="text" name="sesso" value={editFormData.sesso} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Socio:</label>
                        <input type="checkbox" name="socio" checked={editFormData.socio} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Data di Nascita:</label>
                        <input type="date" name="dataNascita" value={editFormData.dataNascita} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Comune di Nascita:</label>
                        <input type="text" name="comuneNascita" value={editFormData.comuneNascita} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Provincia di Nascita:</label>
                        <input type="text" name="provinciaNascita" value={editFormData.provinciaNascita} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Indirizzo di Residenza:</label>
                        <input type="text" name="indirizzoResidenza" value={editFormData.indirizzoResidenza} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Numero di Residenza:</label>
                        <input type="text" name="numeroResidenza" value={editFormData.numeroResidenza} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>CAP di Residenza:</label>
                        <input type="text" name="capResidenza" value={editFormData.capResidenza} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Località di Residenza:</label>
                        <input type="text" name="localitaResidenza" value={editFormData.localitaResidenza} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Provincia di Residenza:</label>
                        <input type="text" name="provinciaResidenza" value={editFormData.provinciaResidenza} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Nazione di Residenza:</label>
                        <input type="text" name="nazioneResidenza" value={editFormData.nazioneResidenza} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Destinazione di Fatturazione:</label>
                        <input type="text" name="destinazioneFatturazione" value={editFormData.destinazioneFatturazione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Indirizzo di Fatturazione:</label>
                        <input type="text" name="indirizzoFatturazione" value={editFormData.indirizzoFatturazione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Numero di Fatturazione:</label>
                        <input type="text" name="numeroFatturazione" value={editFormData.numeroFatturazione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>CAP di Fatturazione:</label>
                        <input type="text" name="capFatturazione" value={editFormData.capFatturazione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Località di Fatturazione:</label>
                        <input type="text" name="localitaFatturazione" value={editFormData.localitaFatturazione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Provincia di Fatturazione:</label>
                        <input type="text" name="provinciaFatturazione" value={editFormData.provinciaFatturazione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Nazione di Fatturazione:</label>
                        <input type="text" name="nazioneFatturazione" value={editFormData.nazioneFatturazione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Codice Fiscale:</label>
                        <input type="text" name="codiceFiscale" value={editFormData.codiceFiscale} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Telefono:</label>
                        <input type="text" name="telefono" value={editFormData.telefono} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Pagamento:</label>
                        <input type="text" name="pagamento" value={editFormData.pagamento} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Codice Destinatario:</label>
                        <input type="text" name="codiceDestinatario" value={editFormData.codiceDestinatario} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Fattura Elettronica:</label>
                        <input type="text" name="fatturaElettronica" value={editFormData.fatturaElettronica} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Codice ERP:</label>
                        <input type="text" name="codiceERP" value={editFormData.codiceERP} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>IBAN:</label>
                        <input type="text" name="IBAN" value={editFormData.IBAN} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Note:</label>
                        <textarea name="note" value={editFormData.note} onChange={handleEditChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Quote:</label>
                        <input type="number" name="quote" value={editFormData.quote} onChange={handleEditChange} />
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
                                <th>Ragione Sociale</th>
                                <td>{cliente.ragioneSociale}</td>
                            </tr>
                            <tr>
                                <th>Nome</th>
                                <td>{cliente.nome}</td>
                            </tr>
                            <tr>
                                <th>Cognome</th>
                                <td>{cliente.cognome}</td>
                            </tr>
                            <tr>
                                <th>Sesso</th>
                                <td>{cliente.sesso}</td>
                            </tr>
                            <tr>
                                <th>Socio</th>
                                <td>{cliente.socio ? 'Sì' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Data di Nascita</th>
                                <td>{new Date(cliente.dataNascita).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <th>Comune di Nascita</th>
                                <td>{cliente.comuneNascita}</td>
                            </tr>
                            <tr>
                                <th>Provincia di Nascita</th>
                                <td>{cliente.provinciaNascita}</td>
                            </tr>
                            <tr>
                                <th>Indirizzo di Residenza</th>
                                <td>{cliente.indirizzoResidenza}</td>
                            </tr>
                            <tr>
                                <th>Numero di Residenza</th>
                                <td>{cliente.numeroResidenza}</td>
                            </tr>
                            <tr>
                                <th>CAP di Residenza</th>
                                <td>{cliente.capResidenza}</td>
                            </tr>
                            <tr>
                                <th>Località di Residenza</th>
                                <td>{cliente.localitaResidenza}</td>
                            </tr>
                            <tr>
                                <th>Provincia di Residenza</th>
                                <td>{cliente.provinciaResidenza}</td>
                            </tr>
                            <tr>
                                <th>Nazione di Residenza</th>
                                <td>{cliente.nazioneResidenza}</td>
                            </tr>
                            <tr>
                                <th>Destinazione di Fatturazione</th>
                                <td>{cliente.destinazioneFatturazione}</td>
                            </tr>
                            <tr>
                                <th>Indirizzo di Fatturazione</th>
                                <td>{cliente.indirizzoFatturazione}</td>
                            </tr>
                            <tr>
                                <th>Numero di Fatturazione</th>
                                <td>{cliente.numeroFatturazione}</td>
                            </tr>
                            <tr>
                                <th>CAP di Fatturazione</th>
                                <td>{cliente.capFatturazione}</td>
                            </tr>
                            <tr>
                                <th>Località di Fatturazione</th>
                                <td>{cliente.localitaFatturazione}</td>
                            </tr>
                            <tr>
                                <th>Provincia di Fatturazione</th>
                                <td>{cliente.provinciaFatturazione}</td>
                            </tr>
                            <tr>
                                <th>Nazione di Fatturazione</th>
                                <td>{cliente.nazioneFatturazione}</td>
                            </tr>
                            <tr>
                                <th>Codice Fiscale</th>
                                <td>{cliente.codiceFiscale}</td>
                            </tr>
                            <tr>
                                <th>Telefono</th>
                                <td>{cliente.telefono}</td>
                            </tr>
                            <tr>
                                <th>Email</th>
                                <td>{cliente.email}</td>
                            </tr>
                            <tr>
                                <th>Pagamento</th>
                                <td>{cliente.pagamento}</td>
                            </tr>
                            <tr>
                                <th>Codice Destinatario</th>
                                <td>{cliente.codiceDestinatario}</td>
                            </tr>
                            <tr>
                                <th>Fattura Elettronica</th>
                                <td>{cliente.fatturaElettronica}</td>
                            </tr>
                            <tr>
                                <th>Codice ERP</th>
                                <td>{cliente.codiceERP}</td>
                            </tr>
                            <tr>
                                <th>IBAN</th>
                                <td>{cliente.IBAN}</td>
                            </tr>
                            <tr>
                                <th>Note</th>
                                <td>{cliente.note}</td>
                            </tr>
                            <tr>
                                <th>Quote</th>
                                <td>{cliente.quote}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="btn-container">
                        <button onClick={fetchContatori} className="btn btn-show-contatori">Visualizza Contatori</button>
                        <button onClick={fetchFatture} className="btn btn-show-fatture">Visualizza Fatture</button>
                        <button onClick={handleOpenContatoreModal} className="btn btn-associate-contatore">Associa Contatore</button>
                        <button onClick={handleOpenFatturaModal} className="btn btn-associate-fattura">Associa Fattura</button>
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={onDeselectCliente} className="btn btn-back">Indietro</button>
            </div>
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
                                    <td colSpan="8">Nessun contatore associata</td>
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
            {showFatture && (
                <div className="fatture-section">
                    <h3>Fatture Associate</h3>
                    <table className="fatture-table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
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
                                    <td>{fattura.tipo}</td>
                                    <td>{fattura.ragioneSociale}</td>
                                    <td>{fattura.anno}</td>
                                    <td>{fattura.numero}</td>
                                    <td>{new Date(fattura.data).toLocaleDateString()}</td>
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
