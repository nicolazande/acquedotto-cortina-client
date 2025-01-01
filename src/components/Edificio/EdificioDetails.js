import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import edificioApi from '../../api/edificioApi';
import contatoreApi from '../../api/contatoreApi';
import '../../styles/Edificio/EdificioDetails.css';
import EdificioEditor from '../shared/EdificioEditor';
import ContatoreEditor from '../shared/ContatoreEditor';
import ContatoreList from '../Contatore/ContatoreList';


const EdificioDetails = () => {
    const { id: edificioId } = useParams();
    const history = useHistory();

    const [edificio, setEdificio] = useState(null);

    const [contatori, setContatori] = useState([]);
    const [showContatori, setShowContatori] = useState(false);
    const [associatingContatore, setAssociatingContatore] = useState(false);
    const [creatingContatore, setCreatingContatore] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('contatori');
    

    const resetViews = () => {
        setShowContatori(false);
        setAssociatingContatore(false);
        setCreatingContatore(false);
        setContatori([]);
    };

    const fetchEdificio = useCallback(async () => {
        try {
            const response = await edificioApi.getEdificio(edificioId);
            setEdificio(response.data);
            resetViews();
        } catch (error) {
            alert('Errore durante il recupero dell\'edificio');
            console.error(error);
        }
    }, [edificioId]);

    const handleEditEdificio = async (updatedEdificio) => {
        try {
            await edificioApi.updateEdificio(edificioId, updatedEdificio);
            alert('Edificio aggiornato con successo');
            setIsEditing(false);
            fetchEdificio();
        } catch (error) {
            alert('Errore durante l\'aggiornamento dell\'edificio');
            console.error(error);
        }
    };

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

    const handleAssociaContatore = async (contatoreId) => {
        try {
            await edificioApi.associateContatore(edificioId, contatoreId);
            alert('Contatore associato con successo.');
            setAssociatingContatore(false);
        } catch (error) {
            console.error('Errore durante l\'associazione del contatore:', error);
            alert('Errore durante l\'associazione del contatore.');
        }
    };

    const handleCreateContatore = async (newContatore) => {
        try {
            const response = await contatoreApi.createContatore(newContatore);
            await edificioApi.associateContatore(edificioId, response.data._id);
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
        if (edificioId) fetchEdificio();
    }, [edificioId, fetchEdificio]);

    if (!edificio) {
        return <div>Seleziona un edificio per vedere i dettagli</div>;
    }

    return (
        <div className="edificio-details">
            <h2>Dettagli Edificio</h2>
            {isEditing ? (
                <EdificioEditor
                    edificio={edificio}
                    onSave={handleEditEdificio}
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
                                    <th>Descrizione</th>
                                    <td>{edificio.descrizione || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Indirizzo</th>
                                    <td>{edificio.indirizzo || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Numero</th>
                                    <td>{edificio.numero || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>CAP</th>
                                    <td>{edificio.cap || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Località</th>
                                    <td>{edificio.localita || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Latitudine</th>
                                    <td>{edificio.latitudine || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Longitudine</th>
                                    <td>{edificio.longitudine || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tabs-container">
                        {/* Tab Navigation */}
                        <div className="tabs">
                            {[
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
            
            {showContatori && (
                <div className="contatori-section">
                    <h3>Contatori Associati</h3>
                    <table className="contatori-table">
                        <thead>
                            <tr>
                                <th>Seriale</th>
                                <th>Seriale Interno</th>
                                <th>Cliente</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contatori.length === 0 ? (
                                <tr>
                                    <td colSpan="4">Nessun contatore associato</td>
                                </tr>
                            ) : (
                                contatori.map((contatore) => (
                                    <tr key={contatore._id}>
                                        <td>{contatore.seriale}</td>
                                        <td>{contatore.seriale_interno}</td>
                                        <td>{contatore.nome_cliente || 'N/A'}</td>
                                        <td>
                                            <button
                                                className="btn btn-view"
                                                onClick={() =>
                                                    history.push(`/contatori/${contatore._id}`)
                                                }
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
                    contatore={{
                        nome_edificio: edificio.descrizione,
                    }}
                    onSave={handleCreateContatore}
                    onCancel={() => setCreatingContatore(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default EdificioDetails;
