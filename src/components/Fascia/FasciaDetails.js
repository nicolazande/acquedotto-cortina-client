import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import fasciaApi from '../../api/fasciaApi';
import listinoApi from '../../api/listinoApi';
import '../../styles/Fascia/FasciaDetails.css';
import ListinoList from '../Listino/ListinoList';

const FasciaDetails = () => {
    const { id: fasciaId } = useParams();
    const history = useHistory();
    const [fascia, setFascia] = useState(null);
    const [listino, setListino] = useState(null);
    const [showListino, setShowListino] = useState(false);
    const [showListinoModal, setShowListinoModal] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);

    const fetchFascia = useCallback(async () => {
        try {
            const response = await fasciaApi.getFascia(fasciaId);
            setFascia(response.data);

            if (response.data.listino) {
                const listinoResponse = await listinoApi.getListino(response.data.listino);
                setListino(listinoResponse.data);
            }
        } catch (error) {
            console.error('Errore durante il recupero della fascia:', error);
            alert('Errore durante il recupero della fascia.');
        }
    }, [fasciaId]);

    useEffect(() => {
        if (fasciaId) fetchFascia();
    }, [fasciaId, fetchFascia]);

    const handleAssociaListino = async (listinoId) => {
        try {
            await fasciaApi.associateListino(fasciaId, listinoId);
            const listinoResponse = await listinoApi.getListino(listinoId);
            setListino(listinoResponse.data);
            alert('Listino associato con successo.');
            setShowListinoModal(false);
        } catch (error) {
            console.error('Errore durante l\'associazione del listino:', error);
            alert('Errore durante l\'associazione del listino.');
        }
    };

    const handleSaveFascia = async (updatedFascia) => {
        try {
            await fasciaApi.updateFascia(fasciaId, updatedFascia);
            setFascia(updatedFascia);
            setIsEditing(false);
            alert('Fascia aggiornata con successo.');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento della fascia:', error);
            alert('Errore durante l\'aggiornamento della fascia.');
        }
    };

    const handleBackClick = () => {
        history.goBack();
    };

    if (!fascia) {
        return <div>Seleziona una fascia per vedere i dettagli...</div>;
    }

    return (
        <div className="fascia-details">
            <h2>Dettagli Fascia</h2>
            {isEditing ? (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveFascia(fascia);
                }}>
                    <div className="form-group">
                        <label>Tipo:</label>
                        <input
                            type="text"
                            name="tipo"
                            value={fascia.tipo || ''}
                            onChange={(e) => setFascia({ ...fascia, tipo: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Min:</label>
                        <input
                            type="number"
                            name="min"
                            value={fascia.min || ''}
                            onChange={(e) => setFascia({ ...fascia, min: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Max:</label>
                        <input
                            type="number"
                            name="max"
                            value={fascia.max || ''}
                            onChange={(e) => setFascia({ ...fascia, max: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Prezzo:</label>
                        <input
                            type="number"
                            name="prezzo"
                            value={fascia.prezzo || ''}
                            onChange={(e) => setFascia({ ...fascia, prezzo: e.target.value })}
                        />
                    </div>
                    <div className="btn-container">
                        <button type="submit" className="btn btn-save">Salva</button>
                        <button type="button" className="btn btn-cancel" onClick={() => setIsEditing(false)}>
                            Annulla
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="table-container">
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Tipo</th>
                                    <td>{fascia.tipo || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Min</th>
                                    <td>{fascia.min || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Max</th>
                                    <td>{fascia.max || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Prezzo</th>
                                    <td>{fascia.prezzo || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Listino</th>
                                    <td>{listino ? `${listino.categoria} - ${listino.descrizione}` : 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tabs-container">
                        <div className="tabs">
                            <button
                                className={`tab ${activeTab === 'listino' ? 'active' : ''}`}
                                onClick={() => setActiveTab('listino')}
                            >
                                Listino
                            </button>
                        </div>
                        {activeTab === 'listino' && (
                            <div className="listino-box">
                                <button onClick={() => setShowListino(true)} className="btn btn-show-listino">
                                    Visualizza Listino
                                </button>
                                <button onClick={() => setShowListinoModal(true)} className="btn btn-associate-listino">
                                    Associa Listino
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={handleBackClick} className="btn btn-back">Indietro</button>
            </div>
            {showListino && listino && (
                <div className="listino-section">
                    <h3>Listino Associato</h3>
                    <table className="listino-table">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Descrizione</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{listino.categoria}</td>
                                <td>{listino.descrizione}</td>
                                <td>
                                    <button
                                        className="btn btn-edit"
                                        onClick={() => history.push(`/listini/${listino._id}`)}
                                    >
                                        Apri
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {showListinoModal && (
                <ListinoList onSelectListino={handleAssociaListino} />
            )}
        </div>
    );
};

export default FasciaDetails;
