import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import scadenzaApi from '../../api/scadenzaApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Scadenza/ScadenzaDetails.css';
import ScadenzaEditor from '../shared/ScadenzaEditor';
import FatturaEditor from '../shared/FatturaEditor';
import FatturaList from '../Fattura/FatturaList';

const ScadenzaDetails = () => {
    const { id: scadenzaId } = useParams();
    const history = useHistory();
    const [scadenza, setScadenza] = useState(null);
    const [fattura, setFattura] = useState([]);
    const [showFattura, setShowFattura] = useState(false);
    const [associatingFattura, setAssociatingFattura] = useState(false);
    const [creatingFattura, setCreatingFattura] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);


    const resetViews = () => {
        setShowFattura(false);
        setAssociatingFattura(false);
        setCreatingFattura(false);
        setFattura([]);
    };

    const fetchScadenza = useCallback(async () => {
        try {
            const response = await scadenzaApi.getScadenza(scadenzaId);
            setScadenza(response.data);
            resetViews();
        } catch (error) {
            console.error('Errore durante il recupero della scadenza:', error);
            alert('Errore durante il recupero della scadenza.');
        }
    }, [scadenzaId]);

    const handleEditScadenza = async (updatedScadenza) => {
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

    const handleDeleteScadenza = async () => {
        try {
            if (window.confirm('Sei sicuro di voler cancellare questa scadenza?')) {
                await scadenzaApi.deleteScadenza(scadenzaId);
                alert('Scadenza cancellata con successo');
                handleBackClick();
            }
        } catch (error) {
            alert('Errore durante la cancellazione della scadenza');
            console.error(error);
        }
    }; 

    const fetchFattura = async () => {
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
            setAssociatingFattura(false);
            fetchFattura();
        } catch (error) {
            console.error("Errore durante l'associazione della fattura:", error);
            alert("Errore durante l'associazione della fattura.");
        }
    };

    const handleCreateFattura = async (newFattura) => {
        try {
            const response = await fatturaApi.createFattura(newFattura);
            await scadenzaApi.associateFattura(scadenzaId, response.data._id);
            alert('Fattura creata e associata con successo');
            setCreatingFattura(false);
            fetchFattura();
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
        if (scadenzaId) fetchScadenza();
    }, [scadenzaId, fetchScadenza]);

    if (!scadenza) {
        return <div>Seleziona una scadenza per vedere i dettagli...</div>;
    }

    return (
        <div className="scadenza-details">
            <h2>Dettagli Scadenza</h2>
            {isEditing ? (
                <ScadenzaEditor
                    scadenza={scadenza}
                    onSave={handleEditScadenza}
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
                            <button onClick={handleDeleteScadenza} className="btn btn-delete">
                                Cancella
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
                                { id: 'fattura', label: 'Fattura' },
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
                        <div className={`tab-content ${activeTab === 'fattura' ? 'show' : ''}`}>
                            {activeTab === 'fattura' && (
                                <div className="fattura-box">
                                    <button onClick={fetchFattura} className="btn btn-show-fattura">
                                        Visualizza Fattura
                                    </button>
                                    <button onClick={() => setAssociatingFattura(true)} className="btn btn-associate-fattura">
                                        Associa Fattura
                                    </button>
                                    <button onClick={() => setCreatingFattura(true)} className="btn btn-create-fattura">
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

            {showFattura && fattura && (
                <div className="fattura-section">
                    <h3>Fattura Associata</h3>
                        <table className="fattura-table">
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
                                <tr>
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
                        scadenza: scadenza._id,
                    }}
                    onSave={handleCreateFattura}
                    onCancel={() => setCreatingFattura(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default ScadenzaDetails;
