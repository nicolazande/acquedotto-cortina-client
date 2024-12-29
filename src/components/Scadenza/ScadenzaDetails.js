import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import scadenzaApi from '../../api/scadenzaApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Scadenza/ScadenzaDetails.css';
import ScadenzaEditor from '../shared/ScadenzaEditor';
import FatturaList from '../Fattura/FatturaList';

const ScadenzaDetails = () => {
    const { id: scadenzaId } = useParams();
    const history = useHistory();

    const [scadenza, setScadenza] = useState(null);
    const [fattura, setFattura] = useState([]);
    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);
    const [showFattura, setShowFattura] = useState(false);
    const [showFatturaModal, setShowFatturaModal] = useState(false);

    const fetchScadenza = useCallback(async () => {
        try {
            const response = await scadenzaApi.getScadenza(scadenzaId);
            setScadenza(response.data);
        } catch (error) {
            console.error('Errore durante il recupero della scadenza:', error);
            alert('Errore durante il recupero della scadenza.');
        }
    }, [scadenzaId]);

    useEffect(() => {
        if (scadenzaId) fetchScadenza();
    }, [scadenzaId, fetchScadenza]);

    const fetchFatturaAssociata = async () => {
        try {
            const response = await scadenzaApi.getFattura(scadenzaId);
            setFattura(response.data);
            setShowFattura(true);
        } catch (error) {
            console.error('Errore durante il recupero delle fattura:', error);
            alert('Errore durante il recupero delle fattura.');
        }
    };

    const handleAssociaFattura = async (fatturaId) => {
        try {
            await scadenzaApi.associateFattura(scadenzaId, fatturaId);
            alert('Fattura associata con successo.');
            setShowFatturaModal(false);
            fetchScadenza();
        } catch (error) {
            console.error("Errore durante l'associazione della fattura:", error);
            alert("Errore durante l'associazione della fattura.");
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setShowFatturaModal(false);
    };

    const handleSaveScadenza = async (updatedScadenza) => {
        try {
            await scadenzaApi.updateScadenza(scadenzaId, updatedScadenza);
            setScadenza(updatedScadenza);
            setIsEditing(false);
            alert('Scadenza aggiornata con successo.');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento della scadenza:', error);
            alert('Errore durante l\'aggiornamento della scadenza.');
        }
    };

    const handleBackClick = () => {
        history.goBack();
    };

    if (!scadenza) {
        return <div>Seleziona una scadenza per vedere i dettagli...</div>;
    }

    return (
        <div className="scadenza-details">
            <h2>Dettagli Scadenza</h2>
            {isEditing ? (
                <ScadenzaEditor
                    scadenza={scadenza}
                    onSave={handleSaveScadenza}
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
                                    <th>Anno</th>
                                    <td>{scadenza.anno}</td>
                                </tr>
                                <tr>
                                    <th>Numero</th>
                                    <td>{scadenza.numero}</td>
                                </tr>
                                <tr>
                                    <th>Cognome</th>
                                    <td>{scadenza.cognome}</td>
                                </tr>
                                <tr>
                                    <th>Nome</th>
                                    <td>{scadenza.nome}</td>
                                </tr>
                                <tr>
                                    <th>Totale</th>
                                    <td>€{scadenza.totale.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Saldo</th>
                                    <td>{scadenza.saldo ? 'Sì' : 'No'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tabs-container">
                        <div className="tabs">
                            {[
                                { id: 'fattura', label: 'Fatture' },
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
                        {activeTab === 'fattura' && (
                            <div className="fattura-box">
                                <button onClick={fetchFatturaAssociata} className="btn btn-show-fattura">
                                    Visualizza Fattura
                                </button>
                                <button onClick={() => setShowFatturaModal(true)} className="btn btn-associate-fattura">
                                    Associa Fattura
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={handleBackClick} className="btn btn-back">Indietro</button>
            </div>
            {showFattura && fattura && (
                <div className="fattura-section">
                    <h3>Fattura Associata</h3>
                    <table className="fattura-table">
                        <thead>
                            <tr>
                                <th>Codice</th>
                                <th>Importo</th>
                                <th>Data</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{fattura.codice || 'N/A'}</td>
                                <td>{fattura.totale_fattura?.toFixed(2) || '0.00'}</td>
                                <td>{fattura.data_fattura ? new Date(fattura.data_fattura).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-edit"
                                        onClick={() => history.push(`/fatture/${fattura._id}`)}
                                    >
                                        Apri
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {showFatturaModal && (
                <FatturaList
                    onSelectFattura={handleAssociaFattura}
                />
            )}
        </div>
    );
};

export default ScadenzaDetails;
