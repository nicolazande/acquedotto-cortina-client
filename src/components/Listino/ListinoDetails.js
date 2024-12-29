import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import listinoApi from '../../api/listinoApi';
import fasciaApi from '../../api/fasciaApi';
import contatoreApi from '../../api/contatoreApi';
import '../../styles/Listino/ListinoDetails.css';
import ListinoEditor from '../shared/ListinoEditor';
import FasciaList from '../Fascia/FasciaList';
import ContatoreList from '../Contatore/ContatoreList';

const ListinoDetails = () => {
    const { id: listinoId } = useParams();
    const history = useHistory();
    const [listino, setListino] = useState(null);
    const [fasce, setFasce] = useState([]);
    const [contatori, setContatori] = useState([]);
    const [showFasce, setShowFasce] = useState(false);
    const [showFasceModal, setShowFasceModal] = useState(false);
    const [showContatori, setShowContatori] = useState(false);
    const [showContatoriModal, setShowContatoriModal] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);

    const fetchListino = useCallback(async () => {
        try {
            const response = await listinoApi.getListino(listinoId);
            setListino(response.data);
        } catch (error) {
            console.error('Errore durante il recupero del listino:', error);
            alert('Errore durante il recupero del listino.');
        }
    }, [listinoId]);

    useEffect(() => {
        if (listinoId) fetchListino();
    }, [listinoId, fetchListino]);

    const fetchFasceAssociati = async () => {
        try {
            const response = await listinoApi.getFasce(listinoId);
            setFasce(response.data);
            setShowFasce(true);
        } catch (error) {
            console.error('Errore durante il recupero delle fasce:', error);
            alert('Errore durante il recupero delle fasce.');
        }
    };

    const fetchContatoriAssociati = async () => {
        try {
            const response = await listinoApi.getContatori(listinoId);
            setContatori(response.data);
            setShowContatori(true);
        } catch (error) {
            console.error('Errore durante il recupero dei contatori:', error);
            alert('Errore durante il recupero dei contatori.');
        }
    };

    const handleAssociaFascia = async (fasciaId) => {
        try {
            await listinoApi.associateFascia(listinoId, fasciaId);
            alert('Fascia associata con successo.');
            setShowFasceModal(false);
        } catch (error) {
            console.error('Errore durante l\'associazione della fascia:', error);
            alert('Errore durante l\'associazione della fascia.');
        }
    };

    const handleAssociaContatore = async (contatoreId) => {
        try {
            await listinoApi.associateContatore(listinoId, contatoreId);
            alert('Contatore associato con successo.');
            setShowContatoriModal(false);
        } catch (error) {
            console.error('Errore durante l\'associazione del contatore:', error);
            alert('Errore durante l\'associazione del contatore.');
        }
    };

    const handleSaveListino = async (updatedListino) => {
        try {
            await listinoApi.updateListino(listinoId, updatedListino);
            setListino(updatedListino);
            setIsEditing(false);
            alert('Listino aggiornato con successo.');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento del listino:', error);
            alert('Errore durante l\'aggiornamento del listino.');
        }
    };

    const handleBackClick = () => {
        history.goBack();
    };

    if (!listino) {
        return <div>Seleziona un listino per vedere i dettagli...</div>;
    }

    return (
        <div className="listino-details">
            <h2>Dettagli Listino</h2>
            {isEditing ? (
                <ListinoEditor
                    listino={listino}
                    onSave={handleSaveListino}
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
                                    <th>Categoria</th>
                                    <td>{listino.categoria || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Descrizione</th>
                                    <td>{listino.descrizione || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tabs-container">
                        <div className="tabs">
                            {[
                                { id: 'fasce', label: 'Fasce' },
                                { id: 'contatori', label: 'Contatori' },
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
                        {activeTab === 'fasce' && (
                            <div className="fasce-box">
                                <button onClick={fetchFasceAssociati} className="btn btn-show-fasce">
                                    Visualizza Fasce
                                </button>
                                <button onClick={() => setShowFasceModal(true)} className="btn btn-associate-fascia">
                                    Associa Fascia
                                </button>
                            </div>
                        )}
                        {activeTab === 'contatori' && (
                            <div className="contatori-box">
                                <button onClick={fetchContatoriAssociati} className="btn btn-show-contatori">
                                    Visualizza Contatori
                                </button>
                                <button onClick={() => setShowContatoriModal(true)} className="btn btn-associate-contatore">
                                    Associa Contatore
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={handleBackClick} className="btn btn-back">Indietro</button>
            </div>
            {showFasce && (
                <div className="fasce-section">
                    <h3>Fasce Associate</h3>
                    <table className="fasce-table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Prezzo</th>
                                <th>Scadenza</th>
                                <th>Fisso</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fasce.length === 0 ? (
                                <tr>
                                    <td colSpan="6">Nessuna fascia associata</td>
                                </tr>
                            ) : (
                                fasce.map((fascia) => (
                                    <tr key={fascia._id}>
                                        <td>{fascia.tipo}</td>
                                        <td>{fascia.min}</td>
                                        <td>{fascia.max}</td>
                                        <td>{fascia.prezzo}</td>
                                        <td>{new Date(fascia.scadenza).toLocaleDateString()}</td>
                                        <td>
                                            <input type="checkbox" checked={fascia.fisso} readOnly />
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-edit"
                                                onClick={() => history.push(`/fasce/${fascia._id}`)}
                                            >
                                                Apri
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
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
                                    <td colSpan="7">Nessun contatore associato</td>
                                </tr>
                            ) : (
                                contatori.map((contatore) => (
                                    <tr key={contatore._id}>
                                        <td>{contatore.seriale}</td>
                                        <td>{contatore.serialeInterno}</td>
                                        <td>{new Date(contatore.ultimaLettura).toLocaleDateString()}</td>
                                        <td>{contatore.attivo ? 'No' : 'Sì'}</td>
                                        <td>{contatore.condominiale ? 'Sì' : 'No'}</td>
                                        <td>{contatore.sostituzione ? 'Sì' : 'No'}</td>
                                        <td>{contatore.subentro ? 'Sì' : 'No'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {showFasceModal && (
                <FasciaList
                    onSelectFascia={handleAssociaFascia}
                />
            )}
            {showContatoriModal && (
                <ContatoreList
                    onSelectContatore={handleAssociaContatore}
                />
            )}
        </div>
    );
};

export default ListinoDetails;
