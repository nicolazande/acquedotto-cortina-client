import React, { useEffect, useState } from 'react';
import edificioApi from '../../api/edificioApi';
import contatoreApi from '../../api/contatoreApi';
import '../../styles/Edificio/EdificioDetails.css';

const EdificioDetails = ({ edificioId, onDeselectEdificio }) => {
    const [edificio, setEdificio] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [showContatori, setShowContatori] = useState(false);
    const [showContatoreModal, setShowContatoreModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        descrizione: '',
        indirizzo: '',
        numero: '',
        CAP: '',
        localita: '',
        provincia: '',
        nazione: '',
        attivita: '',
        postiLetto: '',
        latitudine: '',
        longitudine: '',
        unitaAbitative: '',
        catasto: '',
        foglio: '',
        PED: '',
        estensione: '',
        tipo: '',
        note: ''
    });

    useEffect(() => {
        const fetchEdificio = async () => {
            try {
                const response = await edificioApi.getEdificio(edificioId);
                setEdificio(response.data);
                setEditFormData({
                    descrizione: response.data.descrizione,
                    indirizzo: response.data.indirizzo,
                    numero: response.data.numero,
                    CAP: response.data.CAP,
                    localita: response.data.localita,
                    provincia: response.data.provincia,
                    nazione: response.data.nazione,
                    attivita: response.data.attivita,
                    postiLetto: response.data.postiLetto,
                    latitudine: response.data.latitudine,
                    longitudine: response.data.longitudine,
                    unitaAbitative: response.data.unitaAbitative,
                    catasto: response.data.catasto,
                    foglio: response.data.foglio,
                    PED: response.data.PED,
                    estensione: response.data.estensione,
                    tipo: response.data.tipo,
                    note: response.data.note
                });
                setShowContatori(false); // Chiude i contatori ogni volta che l'edificioId cambia
            } catch (error) {
                alert('Errore durante il recupero dell\'edificio');
                console.error(error);
            }
        };

        if (edificioId) {
            fetchEdificio();
        }
    }, [edificioId]);

    const fetchContatori = async () => {
        try {
            const response = await edificioApi.getContatori(edificioId);
            setContatori(response.data);
            setShowContatori(true);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleOpenContatoreModal = async () => {
        try {
            const response = await contatoreApi.getContatori();
            setContatori(response.data);
            setShowContatoreModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleSelectContatore = async (contatoreId) => {
        try {
            await edificioApi.associateContatore(edificioId, contatoreId);
            setShowContatoreModal(false);
            fetchContatori();
        } catch (error) {
            alert('Errore durante l\'associazione del contatore');
            console.error(error);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleUpdateEdificio = async (e) => {
        e.preventDefault();
        try {
            await edificioApi.updateEdificio(edificioId, editFormData);
            alert('Edificio aggiornato con successo');
            setIsEditing(false);
            const updatedEdificio = await edificioApi.getEdificio(edificioId);
            setEdificio(updatedEdificio.data);
        } catch (error) {
            alert('Errore durante l\'aggiornamento dell\'edificio');
            console.error(error);
        }
    };

    if (!edificio) {
        return <div>Seleziona un edificio per vedere i dettagli</div>;
    }

    return (
        <div className="edificio-detail">
            <h2>Dettagli Edificio</h2>
            {isEditing ? (
                <form onSubmit={handleUpdateEdificio} className="edit-form">
                    <div className="form-group">
                        <label>Descrizione:</label>
                        <input type="text" name="descrizione" value={editFormData.descrizione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Indirizzo:</label>
                        <input type="text" name="indirizzo" value={editFormData.indirizzo} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Numero:</label>
                        <input type="text" name="numero" value={editFormData.numero} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>CAP:</label>
                        <input type="text" name="CAP" value={editFormData.CAP} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Località:</label>
                        <input type="text" name="localita" value={editFormData.localita} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Provincia:</label>
                        <input type="text" name="provincia" value={editFormData.provincia} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Nazione:</label>
                        <input type="text" name="nazione" value={editFormData.nazione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Attività:</label>
                        <input type="text" name="attivita" value={editFormData.attivita} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Posti Letto:</label>
                        <input type="number" name="postiLetto" value={editFormData.postiLetto} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Latitudine:</label>
                        <input type="number" name="latitudine" value={editFormData.latitudine} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Longitudine:</label>
                        <input type="number" name="longitudine" value={editFormData.longitudine} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Unità Abitative:</label>
                        <input type="number" name="unitaAbitative" value={editFormData.unitaAbitative} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Catasto:</label>
                        <input type="text" name="catasto" value={editFormData.catasto} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Foglio:</label>
                        <input type="text" name="foglio" value={editFormData.foglio} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>PED:</label>
                        <input type="text" name="PED" value={editFormData.PED} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Estensione:</label>
                        <input type="text" name="estensione" value={editFormData.estensione} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Tipo:</label>
                        <input type="text" name="tipo" value={editFormData.tipo} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Note:</label>
                        <textarea name="note" value={editFormData.note} onChange={handleEditChange}></textarea>
                    </div>
                    <button type="submit" className="btn btn-save">Salva</button>
                    <button type="button" className="btn btn-cancel" onClick={() => setIsEditing(false)}>Annulla</button>
                </form>
            ) : (
                <>
                    <table className="edificio-table">
                        <tbody>
                            <tr>
                                <th>Descrizione</th>
                                <td>{edificio.descrizione}</td>
                            </tr>
                            <tr>
                                <th>Indirizzo</th>
                                <td>{edificio.indirizzo}</td>
                            </tr>
                            <tr>
                                <th>Numero</th>
                                <td>{edificio.numero}</td>
                            </tr>
                            <tr>
                                <th>CAP</th>
                                <td>{edificio.CAP}</td>
                            </tr>
                            <tr>
                                <th>Località</th>
                                <td>{edificio.localita}</td>
                            </tr>
                            <tr>
                                <th>Provincia</th>
                                <td>{edificio.provincia}</td>
                            </tr>
                            <tr>
                                <th>Nazione</th>
                                <td>{edificio.nazione}</td>
                            </tr>
                            <tr>
                                <th>Attività</th>
                                <td>{edificio.attivita}</td>
                            </tr>
                            <tr>
                                <th>Posti Letto</th>
                                <td>{edificio.postiLetto}</td>
                            </tr>
                            <tr>
                                <th>Latitudine</th>
                                <td>{edificio.latitudine}</td>
                            </tr>
                            <tr>
                                <th>Longitudine</th>
                                <td>{edificio.longitudine}</td>
                            </tr>
                            <tr>
                                <th>Unità Abitative</th>
                                <td>{edificio.unitaAbitative}</td>
                            </tr>
                            <tr>
                                <th>Catasto</th>
                                <td>{edificio.catasto}</td>
                            </tr>
                            <tr>
                                <th>Foglio</th>
                                <td>{edificio.foglio}</td>
                            </tr>
                            <tr>
                                <th>PED</th>
                                <td>{edificio.PED}</td>
                            </tr>
                            <tr>
                                <th>Estensione</th>
                                <td>{edificio.estensione}</td>
                            </tr>
                            <tr>
                                <th>Tipo</th>
                                <td>{edificio.tipo}</td>
                            </tr>
                            <tr>
                                <th>Note</th>
                                <td>{edificio.note}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="btn-container">
                        <button onClick={fetchContatori} className="btn btn-show-contatori">Visualizza Contatori</button>
                        <button onClick={handleOpenContatoreModal} className="btn btn-associate-contatore">Associa Contatore</button>
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={onDeselectEdificio} className="btn btn-back">Indietro</button>
            </div>
            {showContatori && (
                <div className="contatori-section">
                    <h3>Contatori Associati</h3>
                    <table className="contatori-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
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
                                    <td colSpan="8">Nessun contatore associato</td>
                                </tr>
                            ) : (
                                contatori.map((contatore) => (
                                    <tr key={contatore._id}>
                                        <td>{contatore.cliente ? `${contatore.cliente.nome} ${contatore.cliente.cognome}` : 'N/A'}</td>
                                        <td>{contatore.seriale}</td>
                                        <td>{contatore.serialeInterno}</td>
                                        <td>{new Date(contatore.ultimaLettura).toLocaleDateString()}</td>
                                        <td><input type="checkbox" checked={!contatore.attivo} readOnly /></td>
                                        <td><input type="checkbox" checked={contatore.condominiale} readOnly /></td>
                                        <td><input type="checkbox" checked={contatore.sostituzione} readOnly /></td>
                                        <td><input type="checkbox" checked={contatore.subentro} readOnly /></td>
                                    </tr>
                                ))
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
                        <button onClick={() => setShowContatoreModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EdificioDetails;
