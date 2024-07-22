import React, { useEffect, useState } from 'react';
import scadenzaApi from '../../api/scadenzaApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Scadenza/ScadenzaDetails.css';

const ScadenzaDetails = ({ scadenzaId, onDeselectScadenza }) => {
    const [scadenza, setScadenza] = useState(null);
    const [fatture, setFatture] = useState([]);
    const [showFatturaModal, setShowFatturaModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        const fetchScadenza = async () => {
            try {
                const response = await scadenzaApi.getScadenza(scadenzaId);
                setScadenza(response.data);
                setEditFormData(response.data);
            } catch (error) {
                alert('Errore durante il recupero della scadenza');
                console.error(error);
            }
        };

        if (scadenzaId) {
            fetchScadenza();
        }

        setShowFatturaModal(false);
    }, [scadenzaId]);

    const handleOpenFatturaModal = async () => {
        try {
            const response = await fatturaApi.getFatture();
            setFatture(response.data);
            setShowFatturaModal(true);
        } catch (error) {
            alert('Errore durante il recupero delle fatture');
            console.error(error);
        }
    };

    const handleSelectFattura = async (fatturaId) => {
        try {
            await scadenzaApi.associateFattura(scadenzaId, fatturaId);
            setShowFatturaModal(false);
            const response = await scadenzaApi.getScadenza(scadenzaId);
            setScadenza(response.data);
        } catch (error) {
            alert('Errore durante l\'associazione della fattura');
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
            await scadenzaApi.updateScadenza(scadenzaId, editFormData);
            setScadenza(editFormData);
            setIsEditing(false);
            alert('Scadenza aggiornata con successo');
        } catch (error) {
            alert('Errore durante l\'aggiornamento della scadenza');
            console.error(error);
        }
    };

    if (!scadenza) {
        return <div>Seleziona una scadenza per vedere i dettagli</div>;
    }

    return (
        <div className="scadenza-details">
            <h2>Dettagli Scadenza</h2>
            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Data Scadenza:</label>
                        <input type="date" name="dataScadenza" value={editFormData.dataScadenza} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Importo:</label>
                        <input type="number" name="importo" value={editFormData.importo} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label>Saldo:</label>
                        <input type="checkbox" name="saldo" checked={editFormData.saldo} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Data Pagamento:</label>
                        <input type="date" name="dataPagamento" value={editFormData.dataPagamento} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Ritardo:</label>
                        <input type="checkbox" name="ritardo" checked={editFormData.ritardo} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                        <label>Fattura:</label>
                        <div className="input-group">
                            <input type="text" name="fattura" value={editFormData.fattura ? editFormData.fattura.codice : ''} readOnly />
                            <button type="button" onClick={handleOpenFatturaModal}>Associa Fattura</button>
                        </div>
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
                                <th>Data Scadenza</th>
                                <td>{new Date(scadenza.dataScadenza).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <th>Importo</th>
                                <td>€{scadenza.importo}</td>
                            </tr>
                            <tr>
                                <th>Saldo</th>
                                <td>{scadenza.saldo ? 'Sì' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Data Pagamento</th>
                                <td>{scadenza.dataPagamento ? new Date(scadenza.dataPagamento).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Ritardo</th>
                                <td>{scadenza.ritardo ? 'Sì' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Fattura</th>
                                <td>{scadenza.fattura ? scadenza.fattura.codice : 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="btn-container">
                        <button onClick={handleOpenFatturaModal} className="btn btn-associate-fattura">Associa Fattura</button>
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={onDeselectScadenza} className="btn btn-back">Indietro</button>
            </div>
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
                        <button onClick={() => setShowFatturaModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScadenzaDetails;