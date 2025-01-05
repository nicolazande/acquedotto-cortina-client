import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import fasciaApi from '../../api/fasciaApi';
import listinoApi from '../../api/listinoApi';

import ListinoList from '../Listino/ListinoList';
import FasciaEditor from '../shared/FasciaEditor';
import ListinoEditor from '../shared/ListinoEditor';

import '../../styles/Fascia/FasciaDetails.css';


const FasciaDetails = () => {
    const { id: fasciaId } = useParams();
    const history = useHistory();
    const [fascia, setFascia] = useState(null);
    const [listino, setListino] = useState([]);
    const [showListino, setShowListino] = useState(false);
    const [associatingListino, setAssociatingListino] = useState(false);
    const [creatingListino, setCreatingListino] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);


    const resetViews = () => {
        setShowListino(false);
        setAssociatingListino(false);
        setCreatingListino(false);
        setListino([]);
    };

    const fetchFascia = useCallback(async () => {
        try {
            const response = await fasciaApi.getFascia(fasciaId);
            setFascia(response.data);
            resetViews();
        } catch (error) {
            console.error('Errore durante il recupero della fascia:', error);
            alert('Errore durante il recupero della fascia.');
        }
    }, [fasciaId]);

    const handleEditFascia = async (updatedFascia) => {
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

    const handleDeleteFascia = async () => {
        try {
            if (window.confirm('Sei sicuro di voler cancellare questa fascia?')) {
                await fasciaApi.deleteFascia(fasciaId);
                alert('Fascia cancellata con successo');
                handleBackClick();
            }
        } catch (error) {
            alert('Errore durante la cancellazione della fascia');
            console.error(error);
        }
    };   

    const fetchListino = async () => {
        try {
            const response = await fasciaApi.getListino(fasciaId);
            setListino(response.data);
            setShowListino(true);
        } catch (error) {
            console.error('Errore durante il recupero del listino associato:', error);
            alert('Errore durante il recupero del listino associato.');
        }
    };

    const handleAssociaListino = async (listinoId) => {
        try {
            await fasciaApi.associateListino(fasciaId, listinoId);
            alert('Listino associato con successo.');
            setAssociatingListino(false);
            fetchListino();
        } catch (error) {
            console.error('Errore durante l\'associazione del listino:', error);
            alert('Errore durante l\'associazione del listino.');
        }
    };

    const handleCreateListino = async (newListino) => {
        try {
            const response = await listinoApi.createListino(newListino);
            await fasciaApi.associateListino(fasciaId, response.data._id);
            alert('Listino creato e associato con successo');
            setCreatingListino(false);
            fetchListino();
        } catch (error) {
            alert('Errore durante la creazione o associazione del contatore');
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
        if (fasciaId) fetchFascia();
    }, [fasciaId, fetchFascia]);


    if (!fascia) {
        return <div>Seleziona una fascia per vedere i dettagli...</div>;
    }

    return (
        <div className="lettura-details">
            <h2>Dettagli Fascia</h2>
            {isEditing ? (
                <FasciaEditor
                    fascia={fascia}
                    onSave={handleEditFascia}
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
                            <button onClick={handleDeleteFascia} className="btn btn-delete">
                                Cancella
                            </button>
                        </div>
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Tipo</th>
                                    <td>{fascia.tipo || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Minimo</th>
                                    <td>{fascia.min || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Massimo</th>
                                    <td>{fascia.max || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Prezzo</th>
                                    <td>{fascia.prezzo || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>inizio</th>
                                    <td>{fascia.inizio ? new Date(fascia.inizio).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Scadenza</th>
                                    <td>{fascia.scadenza ? new Date(fascia.scadenza).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tabs-container">
                        {/* Tab Navigation */}
                        <div className="tabs">
                            {[
                                { id: 'listino', label: 'Listino' },
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
                        <div className={`tab-content ${activeTab === 'listino' ? 'show' : ''}`}>
                            {activeTab === 'listino' && (
                                <div className="listino-box">
                                    <button onClick={fetchListino} className="btn btn-show-listino">
                                        Visualizza Listino
                                    </button>
                                    <button onClick={() => setAssociatingListino(true)} className="btn btn-associate-listino">
                                        Associa Listino
                                    </button>
                                    <button onClick={() => setCreatingListino(true)} className="btn btn-create-listino">
                                        Crea Listino
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
            {associatingListino && (
                <ListinoList
                    onSelectListino={handleAssociaListino}
                />
            )}
            {creatingListino && (
                <ListinoEditor
                    onSave={handleCreateListino}
                    onCancel={() => setCreatingListino(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default FasciaDetails;
