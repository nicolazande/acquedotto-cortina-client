import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import edificioApi from '../../api/edificioApi';
import contatoreApi from '../../api/contatoreApi';
import '../../styles/Edificio/EdificioDetails.css';
import EdificioEditor from '../shared/EdificioEditor';
import ContatoreEditor from '../shared/ContatoreEditor';

const EdificioDetails = () => {
    const { id: edificioId } = useParams();
    const history = useHistory();

    const [edificio, setEdificio] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [showContatori, setShowContatori] = useState(false);
    const [showContatoreModal, setShowContatoreModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('contatori');
    const [contatoriList, setContatoriList] = useState([]);
    const [creatingContatore, setCreatingContatore] = useState(false);

    const fetchEdificio = useCallback(async () => {
        try {
            const response = await edificioApi.getEdificio(edificioId);
            setEdificio(response.data);
        } catch (error) {
            alert('Errore durante il recupero dell\'edificio');
            console.error(error);
        }
    }, [edificioId]);

    useEffect(() => {
        if (edificioId) fetchEdificio();
    }, [edificioId, fetchEdificio]);

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
            setContatoriList(response.data);
            setShowContatoreModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
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

    const handleSaveEdificio = async (updatedEdificio) => {
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

    const handleBackClick = () => {
        history.goBack();
    };

    if (!edificio) {
        return <div>Seleziona un edificio per vedere i dettagli</div>;
    }

    return (
        <div className="edificio-details">
            <h2>Dettagli Edificio</h2>
            {isEditing ? (
                <EdificioEditor
                    edificio={edificio}
                    onSave={handleSaveEdificio}
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
                        <div className="tabs">
                            <button
                                className={`tab ${activeTab === 'contatori' ? 'active' : ''}`}
                                onClick={() => setActiveTab('contatori')}
                            >
                                Contatori
                            </button>
                        </div>
                        <div className={`tab-content ${activeTab === 'contatori' ? 'show' : ''}`}>
                            <div className="contatori-box">
                                <button onClick={fetchContatori} className="btn btn-show-contatori">
                                    Visualizza Contatori
                                </button>
                                <button onClick={() => setCreatingContatore(true)} className="btn btn-create-contatore">
                                    Crea Contatore
                                </button>
                                <button onClick={handleOpenContatoreModal} className="btn btn-associate-contatore">
                                    Associa Contatore
                                </button>
                                {showContatori && (
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
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={handleBackClick} className="btn btn-back">
                    Indietro
                </button>
            </div>
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
            {showContatoreModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Seleziona Contatore</h3>
                            <button
                                className="btn btn-close"
                                onClick={() => setShowContatoreModal(false)}
                            >
                                Chiudi
                            </button>
                        </div>
                        <table className="contatori-table">
                            <thead>
                                <tr>
                                    <th>Seriale</th>
                                    <th>Nome Cliente</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contatoriList.map((contatore) => (
                                    <tr key={contatore._id}>
                                        <td>{contatore.seriale}</td>
                                        <td>{contatore.nome_cliente || 'N/A'}</td>
                                        <td>
                                            <button
                                                className="btn btn-select"
                                                onClick={() => handleSelectContatore(contatore._id)}
                                            >
                                                Seleziona
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EdificioDetails;
