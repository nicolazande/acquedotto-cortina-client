import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import letturaApi from '../../api/letturaApi';
import contatoreApi from '../../api/contatoreApi';
import servizioApi from '../../api/servizioApi';
import '../../styles/Lettura/LetturaDetails.css';
import LetturaEditor from '../shared/LetturaEditor';
import ContatoreEditor from '../shared/ContatoreEditor';
import ServizioEditor from '../shared/ServizioEditor';
import ContatoreList from '../Contatore/ContatoreList';

const LetturaDetails = () => {
    const { id: letturaId } = useParams();
    const history = useHistory();

    const [lettura, setLettura] = useState(null);
    const [servizi, setServizi] = useState([]);
    const [contatore, setContatore] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [activeTab, setActiveTab] = useState('servizi');
    const [showAssociatedServizi, setShowAssociatedServizi] = useState(false);
    const [showAssociatedContatore, setShowAssociatedContatore] = useState(false);
    const [creatingContatore, setCreatingContatore] = useState(false);
    const [creatingServizio, setCreatingServizio] = useState(false);
    const [serviziList, setServiziList] = useState([]);
    const [showServizioModal, setShowServizioModal] = useState(false);
    const [showContatoreModal, setShowContatoreModal] = useState(false);

    const fetchLettura = useCallback(async () => {
        try {
            const response = await letturaApi.getLettura(letturaId);
            setLettura(response.data);
            setEditFormData(response.data);
            setServizi(response.data.servizi || []);
            setContatore(response.data.contatore || null);
        } catch (error) {
            console.error('Errore durante il recupero della lettura:', error);
            alert('Errore durante il recupero della lettura.');
        }
    }, [letturaId]);

    const fetchAssociatedServizi = async () => {
        try {
            const response = await letturaApi.getServizi(letturaId);
            setServizi(response.data);
            setShowAssociatedServizi(true);
        } catch (error) {
            console.error('Errore durante il recupero dei servizi associati:', error);
            alert('Errore durante il recupero dei servizi associati.');
        }
    };

    const fetchServiziList = async () => {
        try {
            const response = await servizioApi.getServizi();
            setServiziList(response.data);
            setShowServizioModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei servizi');
            console.error(error);
        }
    };

    const fetchContatoriList = async () => {
        try {
            setShowContatoreModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleCreateServizio = async (newServizio) => {
        try {
            const response = await servizioApi.createServizio(newServizio);
            await letturaApi.associateServizio(letturaId, response.data._id);
            alert('Servizio creato e associato con successo');
            setCreatingServizio(false);
            fetchLettura();
        } catch (error) {
            alert('Errore durante la creazione o associazione del servizio');
            console.error(error);
        }
    };

    const handleCreateContatore = async (newContatore) => {
        try {
            const response = await contatoreApi.createContatore(newContatore);
            await letturaApi.associateContatore(letturaId, response.data._id);
            alert('Contatore creato e associato con successo');
            setCreatingContatore(false);
            fetchLettura();
        } catch (error) {
            alert('Errore durante la creazione o associazione del contatore');
            console.error(error);
        }
    };

    const handleSelectServizio = async (servizioId) => {
        try {
            await letturaApi.associateServizio(letturaId, servizioId);
            setShowServizioModal(false);
            fetchLettura();
        } catch (error) {
            alert("Errore durante l'associazione del servizio");
            console.error(error);
        }
    };
    
    const handleSelectContatore = async (contatoreId) => {
        try {
            await letturaApi.associateContatore(letturaId, contatoreId);
            setShowContatoreModal(false);
            fetchLettura();
        } catch (error) {
            alert("Errore durante l'associazione del contatore");
            console.error(error);
        }
    };

    const handleAssociateContatore = async (contatoreId) => {
        try {
            await letturaApi.associateContatore(letturaId, contatoreId);
            alert('Contatore associato con successo');
            setShowContatoreModal(false); // Close the ContatoreList view
            fetchLettura();
        } catch (error) {
            alert("Errore durante l'associazione del contatore");
            console.error(error);
        }
    };

    const handleNavigateToServizio = (servizioId) => {
        history.push(`/servizi/${servizioId}`);
    };
    
    const handleNavigateToContatore = (contatoreId) => {
        history.push(`/contatori/${contatoreId}`);
    };

    useEffect(() => {
        if (letturaId) fetchLettura();
    }, [letturaId, fetchLettura]);

    if (!lettura) return <div>Caricamento...</div>;

    return (
        <div className="lettura-details">
            <h2>Dettagli Lettura</h2>
            {isEditing ? (
                <LetturaEditor
                    lettura={editFormData}
                    onSave={(updatedLettura) => {
                        setIsEditing(false);
                        setLettura(updatedLettura);
                    }}
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
                                    <th>Tipo</th>
                                    <td>{lettura.tipo || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Data</th>
                                    <td>{new Date(lettura.data_lettura).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <th>Consumo</th>
                                    <td>{lettura.consumo || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Unita' di misura</th>
                                    <td>{lettura.unita_misura || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Fatturata</th>
                                    <td>{lettura.fatturata ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Note</th>
                                    <td>{lettura.note || '-'}</td>
                                </tr>
                                <tr>
                                    <th>Contatore</th>
                                    <td>{contatore ? contatore.seriale : 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="tabs-container">
                        <div className="tabs">
                            <button
                                className={`tab ${activeTab === 'servizi' ? 'active' : ''}`}
                                onClick={() => setActiveTab('servizi')}
                            >
                                Servizi
                            </button>
                            <button
                                className={`tab ${activeTab === 'contatori' ? 'active' : ''}`}
                                onClick={() => setActiveTab('contatori')}
                            >
                                Contatori
                            </button>
                        </div>

                        <div className={`tab-content ${activeTab === 'servizi' ? 'show' : ''}`}>
                            {activeTab === 'servizi' && (
                                <div className="servizi-box">
                                    <button onClick={fetchServiziList} className="btn btn-associate-servizio">
                                        Associa Servizio
                                    </button>
                                    <button onClick={() => setCreatingServizio(true)} className="btn btn-create-servizio">
                                        Nuovo Servizio
                                    </button>
                                    <button
                                        onClick={fetchAssociatedServizi}
                                        className="btn btn-view-servizi"
                                    >
                                        Visualizza Servizi
                                    </button>
                                    {showAssociatedServizi && servizi.length > 0 ? (
                                        <table className="servizi-table">
                                            <thead>
                                                <tr>
                                                    <th>Descrizione</th>
                                                    <th>Valore</th>
                                                    <th>Azioni</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {servizi.map((servizio) => (
                                                    <tr key={servizio._id}>
                                                        <td>{servizio.descrizione}</td>
                                                        <td>{servizio.valore_unitario}</td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleNavigateToServizio(servizio._id)}
                                                                className="btn btn-open"
                                                            >
                                                                Apri
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        showAssociatedServizi && <p>Nessun servizio associato</p>
                                    )}
                                    {creatingServizio && (
                                        <ServizioEditor
                                            onSave={handleCreateServizio}
                                            onCancel={() => setCreatingServizio(false)}
                                            mode="Nuovo"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={`tab-content ${activeTab === 'contatori' ? 'show' : ''}`}>
                            {activeTab === 'contatori' && (
                                <div className="contatori-box">
                                    <button onClick={fetchContatoriList} className="btn btn-associate-contatore">
                                        Associa Contatore
                                    </button>
                                    <button onClick={() => setCreatingContatore(true)} className="btn btn-create-contatore">
                                        Nuovo Contatore
                                    </button>
                                    <button
                                        onClick={() => setShowAssociatedContatore(!showAssociatedContatore)}
                                        className="btn btn-view-contatori"
                                    >
                                        Visualizza Contatore
                                    </button>
                                    {showAssociatedContatore && contatore ? (
                                        <table className="contatori-table">
                                            <thead>
                                                <tr>
                                                    <th>Seriale</th>
                                                    <th>Azioni</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{contatore.seriale}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleNavigateToContatore(contatore._id)}
                                                            className="btn btn-open"
                                                        >
                                                            Apri
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    ) : (
                                        showAssociatedContatore && <p>Nessun contatore associato</p>
                                    )}
                                    {creatingContatore && (
                                        <ContatoreEditor
                                            onSave={handleCreateContatore}
                                            onCancel={() => setCreatingContatore(false)}
                                            mode="Nuovo"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="btn-back-container">
                <button onClick={() => history.goBack()} className="btn btn-back">
                    Indietro
                </button>
            </div>

            {showServizioModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Seleziona Servizio</h3>
                            <button className="btn btn-close" onClick={() => setShowServizioModal(false)}>
                                Chiudi
                            </button>
                        </div>
                        <table className="servizi-table">
                            <thead>
                                <tr>
                                    <th>Descrizione</th>
                                    <th>Valore</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviziList.map((servizio) => (
                                    <tr key={servizio._id}>
                                        <td>{servizio.descrizione}</td>
                                        <td>{servizio.valore_unitario}</td>
                                        <td>
                                            <button
                                                className="btn btn-select"
                                                onClick={() => handleSelectServizio(servizio._id)}
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

            {showContatoreModal && (
                <ContatoreList
                    onSelectContatore={handleAssociateContatore}
                />
                
            )}
        </div>
    );
};

export default LetturaDetails;
