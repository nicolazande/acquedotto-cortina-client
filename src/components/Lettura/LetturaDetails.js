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
import ServizioList from '../Servizio/ServizioList';


const LetturaDetails = () => {
    const { id: letturaId } = useParams();
    const history = useHistory();
    const [lettura, setLettura] = useState(null);
    const [servizi, setServizi] = useState([]);
    const [showServizi, setShowServizi] = useState(false);
    const [associatingServizio, setAssociatingServizio] = useState(false);
    const [creatingServizio, setCreatingServizio] = useState(false);
    const [contatore, setContatore] = useState([]);
    const [showContatore, setShowContatore] = useState(false);
    const [associatingContatore, setAssociatingContatore] = useState(false);
    const [creatingContatore, setCreatingContatore] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('servizi');


    const resetViews = () => {
        setShowContatore(false);
        setAssociatingContatore(false);
        setCreatingContatore(false);
        setShowServizi(false);
        setAssociatingServizio(false);
        setCreatingServizio(false);
        setContatore([]);
        setServizi([]);
    };
    
    const fetchLettura = useCallback(async () => {
        try {
            const response = await letturaApi.getLettura(letturaId);
            setLettura(response.data);
            resetViews();
        } catch (error) {
            console.error('Errore durante il recupero della lettura:', error);
            alert('Errore durante il recupero della lettura.');
        }
    }, [letturaId]);

    const handleEditLettura = async (updatedLettura) => {
        try {
            await letturaApi.updateLettura(letturaId, updatedLettura);
            setLettura(updatedLettura);
            setIsEditing(false);
            alert('Lettura aggiornata con successo');
        } catch (error) {
            alert('Errore durante l\'aggiornamento della lettura');
            console.error(error);
        }
    };

    const fetchContatori = async () =>
    {
        try
        {
            const response = await letturaApi.getContatore(letturaId);
            setContatore(response.data);
            setShowContatore(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero del contatore');
            console.error(error);
        }
    };

    const handleAssociateContatore = async (contatoreId) => {
        try {
            await letturaApi.associateContatore(letturaId, contatoreId);
            alert('Contatore associato con successo');
            setAssociatingContatore(false); // Close the ContatoreList view
        } catch (error) {
            alert("Errore durante l'associazione del contatore");
            console.error(error);
        }
    };

    const handleCreateContatore = async (newContatore) => {
        try {
            const response = await contatoreApi.createContatore(newContatore);
            await letturaApi.associateContatore(letturaId, response.data._id);
            alert('Contatore creato e associato con successo');
            setCreatingContatore(false);
            fetchContatori();
        } catch (error) {
            alert('Errore durante la creazione o associazione del contatore');
            console.error(error);
        }
    };

    const fetchServizi = async () => {
        try {
            const response = await letturaApi.getServizi(letturaId);
            setServizi(response.data);
            setShowServizi(true);
        } catch (error) {
            console.error('Errore durante il recupero dei servizi associati:', error);
            alert('Errore durante il recupero dei servizi associati.');
        }
    };

    const handleAssociateServizio = async (servizioId) => {
        try {
            await letturaApi.associateServizio(letturaId, servizioId);
            alert('Servizio associato con successo.');
            setAssociatingServizio(false);
            fetchServizi();
        } catch (error) {
            alert("Errore durante l'associazione del servizio");
            console.error(error);
        }
    };

    const handleCreateServizio = async (newServizio) => {
        try {
            const response = await servizioApi.createServizio(newServizio);
            await letturaApi.associateServizio(letturaId, response.data._id);
            alert('Servizio creato e associato con successo');
            setCreatingServizio(false);
            fetchServizi();
        } catch (error) {
            alert('Errore durante la creazione o associazione del servizio');
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
        if (letturaId) fetchLettura();
    }, [letturaId, fetchLettura]);

    if (!lettura) return <div>Caricamento...</div>;

    return (
        <div className="lettura-details">
            <h2>Dettagli Lettura</h2>
            {isEditing ? (
                <LetturaEditor
                    lettura={lettura}
                    onSave={handleEditLettura}
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
                        {/* Tab Navigation */}
                        <div className="tabs">
                            {[
                                { id: 'servizi', label: 'Servizi' },
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
                        <div className={`tab-content ${activeTab === 'servizi' ? 'show' : ''}`}>
                            {activeTab === 'servizi' && (
                                <div className="servizi-box">
                                    <button
                                        onClick={fetchServizi}
                                        className="btn btn-view-servizi"
                                    >
                                        Visualizza Servizi
                                    </button>
                                    <button onClick={() => setAssociatingServizio(true)} className="btn btn-associate-servizio">
                                        Associa Servizio
                                    </button>
                                    <button onClick={() => setCreatingServizio(true)} className="btn btn-create-servizio">
                                        Nuovo Servizio
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={`tab-content ${activeTab === 'contatori' ? 'show' : ''}`}>
                            {activeTab === 'contatori' && (
                                <div className="contatori-box">
                                    <button onClick={fetchContatori} className="btn btn-associate-contatore">
                                        Visualizza Contatore
                                    </button>
                                    <button onClick={() => setAssociatingContatore(true)} className="btn btn-associate-contatore">
                                        Associa Contatore
                                    </button>
                                    <button onClick={() => setCreatingContatore(true)} className="btn btn-create-contatore">
                                        Nuovo Contatore
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

            {showServizi && (
                <div className="contatori-section">
                    <h3>Servizi Associati</h3>
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
                                            className="btn btn-edit"
                                            onClick={() => history.push(`/servizi/${servizio._id}`)}
                                        >
                                        Apri
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {associatingServizio && (
                <ServizioList
                    onSelectServizio={handleAssociateServizio}
                />
            )}
            {creatingServizio && (
                <ServizioEditor
                    servizio={{
                        lettura: lettura._id,
                    }}
                    onSave={handleCreateServizio}
                    onCancel={() => setCreatingServizio(false)}
                    mode="Nuovo"
                />
            )}
            {showContatore && (
                <div className="contatori-section">
                    <h3>Contatori Associati</h3>
                    <table className="contatori-table">
                        <thead>
                            <tr>
                            <th>Seriale</th>
                                <th>Seriale Interno</th>
                                <th>Edificio</th>
                                <th>Inattivo</th>
                                <th>Condominiale</th>
                                <th>Sostituzione</th>
                                <th>Subentro</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{contatore.seriale}</td>
                                <td>{contatore.seriale_interno}</td>
                                <td>{contatore.nome_edificio}</td>
                                <td><input type="checkbox" checked={contatore.inattivo} readOnly /></td>
                                <td><input type="checkbox" checked={contatore.condominiale} readOnly /></td>
                                <td><input type="checkbox" checked={contatore.sostituzione} readOnly /></td>
                                <td><input type="checkbox" checked={contatore.subentro} readOnly /></td>
                                <td>
                                    <button
                                        className="btn btn-edit"
                                        onClick={() => history.push(`/contatori/${contatore._id}`)}
                                    >
                                    Apri
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {associatingContatore && (
                <ContatoreList
                    onSelectContatore={handleAssociateContatore}
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

export default LetturaDetails;
