import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import listinoApi from '../../api/listinoApi';
import fasciaApi from '../../api/fasciaApi';
import contatoreApi from '../../api/contatoreApi';
import '../../styles/Listino/ListinoDetails.css';
import ListinoEditor from '../shared/ListinoEditor';
import FasciaList from '../Fascia/FasciaList';
import ContatoreList from '../Contatore/ContatoreList';
import ContatoreEditor from '../shared/ContatoreEditor';
import FasciaEditor from '../shared/FasciaEditor';

const ListinoDetails = () => {
    const { id: listinoId } = useParams();
    const history = useHistory();

    const [listino, setListino] = useState(null);

    const [fasce, setFasce] = useState([]);
    const [showFasce, setShowFasce] = useState(false);
    const [associatingFascia, setAssociatingFascia] = useState(false);
    const [creatingFascia, setCreatingFascia] = useState(false);

    const [contatori, setContatori] = useState([]);
    const [showContatori, setShowContatori] = useState(false);
    const [associatingContatore, setAssociatingContatore] = useState(false);
    const [creatingContatore, setCreatingContatore] = useState(false);

    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);


    const resetViews = () => {
        setContatori([]);
        setShowContatori(false);
        setAssociatingContatore(false);
        setCreatingContatore(false);
        setFasce([]);
        setShowFasce(false);
        setAssociatingFascia(false);
        setCreatingFascia(false);
    };

    const fetchListino = useCallback(async () => {
        try {
            const response = await listinoApi.getListino(listinoId);
            setListino(response.data);
            resetViews();
        } catch (error) {
            console.error('Errore durante il recupero del listino:', error);
            alert('Errore durante il recupero del listino.');
        }
    }, [listinoId]);

    const handleEditListino = async (updatedListino) => {
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

    const fetchFasce = async () => {
        try {
            const response = await listinoApi.getFasce(listinoId);
            setFasce(response.data);
            setShowFasce(true);
        } catch (error) {
            console.error('Errore durante il recupero delle fasce:', error);
            alert('Errore durante il recupero delle fasce.');
        }
    };

    const handleAssociaFascia = async (fasciaId) => {
        try {
            await listinoApi.associateFascia(listinoId, fasciaId);
            alert('Fascia associata con successo.');
            setAssociatingFascia(false);
            fetchFasce();
        } catch (error) {
            console.error('Errore durante l\'associazione della fascia:', error);
            alert('Errore durante l\'associazione della fascia.');
        }
    };

    const handleCreateFascia = async (newFascia) => {
        try {
            const response = await fasciaApi.createFascia(newFascia);
            await listinoApi.associateFascia(listinoId, response.data._id);
            alert('Fascia creata e associata con successo');
            setCreatingFascia(false);
            fetchFasce();
        } catch (error) {
            alert('Errore durante la creazione o associazione del contatore');
            console.error(error);
        }
    };

    const fetchContatori = async () => {
        try {
            const response = await listinoApi.getContatori(listinoId);
            setContatori(response.data);
            setShowContatori(true);
        } catch (error) {
            console.error('Errore durante il recupero dei contatori:', error);
            alert('Errore durante il recupero dei contatori.');
        }
    };

    const handleAssociaContatore = async (contatoreId) => {
        try {
            await listinoApi.associateContatore(listinoId, contatoreId);
            alert('Contatore associato con successo.');
            setAssociatingContatore(false);
            fetchContatori();
        } catch (error) {
            console.error('Errore durante l\'associazione del contatore:', error);
            alert('Errore durante l\'associazione del contatore.');
        }
    };

    const handleCreateContatore = async (newContatore) => {
        try {
            const response = await contatoreApi.createContatore(newContatore);
            await listinoApi.associateContatore(listinoId, response.data._id);
            alert('Contatore creato e associato con successo');
            setCreatingContatore(false);
            fetchContatori();
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
        if (listinoId) fetchListino();
    }, [listinoId, fetchListino]);

    if (!listino) {
        return <div>Seleziona un listino per vedere i dettagli...</div>;
    }

    return (
        <div className="listino-details">
            <h2>Dettagli Listino</h2>
            {isEditing ? (
                <ListinoEditor
                    listino={listino}
                    onSave={handleEditListino}
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
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {/* Tab Content */}
                        <div className={`tab-content ${activeTab === 'fasce' ? 'show' : ''}`}>
                            {activeTab === 'fasce' && (
                                <div className="fasce-box">
                                    <button onClick={fetchFasce} className="btn btn-show-fasce">
                                        Visualizza Fasce
                                    </button>
                                    <button onClick={() => setAssociatingFascia(true)} className="btn btn-associate-fascia">
                                        Associa Fascia
                                    </button>
                                    <button onClick={() => setCreatingFascia(true)} className="btn btn-create-fascia">
                                        Crea Fascia
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={`tab-content ${activeTab === 'contatori' ? 'show' : ''}`}>
                            {activeTab === 'contatori' && (
                                <div className="contatori-box">
                                    <button onClick={fetchContatori} className="btn btn-show-contatori">
                                        Visualizza Contatori
                                    </button>
                                    <button onClick={() => setAssociatingContatore(true)} className="btn btn-associate-contatore">
                                        Associa Contatore
                                    </button>
                                    <button onClick={() => setCreatingContatore(true)} className="btn btn-create-contatore">
                                        Crea Contatore
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
            {associatingFascia && (
                <FasciaList
                    onSelectFascia={handleAssociaFascia}
                />
            )}
            {creatingFascia && (
                <FasciaEditor
                    onSave={handleCreateFascia}
                    onCancel={() => setCreatingFascia(false)}
                    mode="Nuovo"
                />
            )}

            {showContatori && (
                <div className="contatori-section">
                    <h3>Contatori Associati</h3>
                    <table className="contatori-table">
                        <thead>
                            <tr>
                                <th>Seriale</th>
                                <th>Seriale Interno</th>
                                <th>Attivo</th>
                                <th>Condominiale</th>
                                <th>Sostituzione</th>
                                <th>Subentro</th>
                                <th>Azioni</th>
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
                                        <td>{contatore.seriale_interno}</td>
                                        <td>
                                            <input type="checkbox" checked={!contatore.inattivo} readOnly />
                                        </td>
                                        <td>
                                            <input type="checkbox" checked={contatore.condominiale} readOnly />
                                        </td>
                                        <td>
                                            <input type="checkbox" checked={contatore.sostituzione} readOnly />
                                        </td>
                                        <td>
                                            <input type="checkbox" checked={contatore.subentro} readOnly />
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-edit"
                                                onClick={() => history.push(`/contatori/${contatore._id}`)}
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
            {associatingContatore && (
                <ContatoreList
                    onSelectContatore={handleAssociaContatore}
                />
            )}
            {creatingContatore && (
                <ContatoreEditor
                    onSave={handleCreateContatore}
                    onCancel={() => setCreatingContatore(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default ListinoDetails;
