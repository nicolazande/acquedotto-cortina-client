import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import servizioApi from '../../api/servizioApi';
import letturaApi from '../../api/letturaApi';
import articoloApi from '../../api/articoloApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Servizio/ServizioDetails.css';
import ServizioEditor from '../shared/ServizioEditor';
import LetturaList from '../Lettura/LetturaList';
import LetturaEditor from '../shared/LetturaEditor';
import ArticoloList from '../Articolo/ArticoloList';
import ArticoloEditor from '../shared/ArticoloEditor';
import FatturaList from '../Fattura/FatturaList';
import FatturaEditor from '../shared/FatturaEditor';


const ServizioDetails = () => {
    const { id: servizioId } = useParams();
    const history = useHistory();
    const [servizio, setServizio] = useState(null);
    const [lettura, setLettura] = useState([]);
    const [showLettura, setShowLettura] = useState(false);
    const [associatingLettura, setAssociatingLettura] = useState(false);
    const [creatingLettura, setCreatingLettura] = useState(false);
    const [fattura, setFattura] = useState([]);
    const [showFattura, setShowFattura] = useState(false);
    const [associatingFattura, setAssociatingFattura] = useState(false);
    const [creatingFattura, setCreatingFattura] = useState(false);
    const [articolo, setArticolo] = useState([]);
    const [showArticolo, setShowArticolo] = useState(false);
    const [associatingArticolo, setAssociatingArticolo] = useState(false);
    const [creatingArticolo, setCreatingArticolo] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);


    const resetViews = () => {
        setFattura([]);
        setShowFattura(false);
        setAssociatingFattura(false);
        setCreatingFattura(false);

        setLettura([]);
        setShowLettura(false);
        setAssociatingLettura(false);
        setCreatingLettura(false);

        setArticolo([]);
        setShowArticolo(false);
        setAssociatingArticolo(false);
        setCreatingArticolo(false);
    };

    const fetchServizio = useCallback(async () => {
        try
        {
            const response = await servizioApi.getServizio(servizioId);
            setServizio(response.data);
            resetViews();
        }
        catch (error)
        {
            alert('Errore durante il recupero del servizio');
            console.error(error);
        }
    }, [servizioId]);

    const handleEditServizio = async (updatedServizio) => {
        try {
            await servizioApi.updateServizio(servizioId, updatedServizio);
            setServizio(updatedServizio);
            setIsEditing(false);
            alert('Servizio aggiornato con successo');
        } catch (error) {
            alert('Errore durante l\'aggiornamento del servizio');
            console.error(error);
        }
    };

    const handleDeleteServizio = async () => {
        try {
            if (window.confirm('Sei sicuro di voler cancellare questo servizio?')) {
                await servizioApi.deleteServizio(servizioId);
                alert('Servizio cancellato con successo');
                handleBackClick();
            }
        } catch (error) {
            alert('Errore durante la cancellazione del servizio');
            console.error(error);
        }
    };   

    const fetchFattura = async () => {
        try {
            const response = await servizioApi.getFattura(servizioId);
            setFattura(response.data);
            setShowFattura(true);
        } catch (error) {
            console.error('Errore durante il recupero delle fattura:', error);
            alert('Errore durante il recupero delle fattura.');
        }
    };

    const handleAssociaFattura = async (fatturaId) => {
        try {
            await servizioApi.associateFattura(servizioId, fatturaId);
            alert('Fattura associata con successo.');
            setAssociatingFattura(false);
            fetchFattura();
        } catch (error) {
            console.error('Errore durante l\'associazione della fattura:', error);
            alert('Errore durante l\'associazione della fattura.');
        }
    };

    const handleCreateFattura = async (newFattura) => {
        try {
            const response = await fatturaApi.createFattura(newFattura);
            await servizioApi.associateFattura(servizioId, response.data._id);
            alert('Fattura creata e associata con successo');
            setCreatingFattura(false);
            fetchFattura();
        } catch (error) {
            alert('Errore durante la creazione o associazione della fattura');
            console.error(error);
        }
    };

    const fetchLettura = async () => {
        try {
            const response = await servizioApi.getLettura(servizioId);
            setLettura(response.data);
            setShowLettura(true);
        } catch (error) {
            console.error('Errore durante il recupero delle lettura:', error);
            alert('Errore durante il recupero delle lettura.');
        }
    };

    const handleAssociaLettura = async (letturaId) => {
        try {
            await servizioApi.associateLettura(servizioId, letturaId);
            alert('Lettura associata con successo.');
            setAssociatingLettura(false);
            fetchLettura();
        } catch (error) {
            console.error('Errore durante l\'associazione della lettura:', error);
            alert('Errore durante l\'associazione della lettura.');
        }
    };

    const handleCreateLettura = async (newLettura) => {
        try {
            const response = await letturaApi.createLettura(newLettura);
            await servizioApi.associateLettura(servizioId, response.data._id);
            alert('Contatore creato e associato con successo');
            setCreatingLettura(false);
            fetchLettura();
        } catch (error) {
            alert('Errore durante la creazione o associazione della lettura');
            console.error(error);
        }
    };

    const fetchArticolo = async () => {
        try {
            const response = await servizioApi.getArticolo(servizioId);
            setArticolo(response.data);
            setShowArticolo(true);
        } catch (error) {
            console.error('Errore durante il recupero degli articolo:', error);
            alert('Errore durante il recupero degli articolo.');
        }
    };

    const handleAssociaArticolo = async (articoloId) => {
        try {
            await servizioApi.associateArticolo(servizioId, articoloId);
            alert('Articolo associato con successo.');
            setAssociatingArticolo(false);
            fetchArticolo();
        } catch (error) {
            console.error('Errore durante l\'associazione dell\'articolo:', error);
            alert('Errore durante l\'associazione dell\'articolo.');
        }
    };

    const handleCreateArticolo = async (newArticolo) => {
        try {
            const response = await articoloApi.createArticolo(newArticolo);
            await servizioApi.associateArticolo(servizioId, response.data._id);
            alert('Articolo creato e associato con successo');
            setCreatingArticolo(false);
            fetchArticolo();
        } catch (error) {
            alert('Errore durante la creazione o associazione dell\'articolo');
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
        if (servizioId) fetchServizio();
    }, [servizioId, fetchServizio]);

    if (!servizio) {
        return <div>Seleziona un servizio per vedere i dettagli...</div>;
    }

    return (
        <div className="servizio-details">
            <h2>Dettagli Servizio</h2>
            {isEditing ? (
                <ServizioEditor
                    servizio={servizio}
                    onSave={handleEditServizio}
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
                            <button onClick={handleDeleteServizio} className="btn btn-delete">
                                Cancella
                            </button>
                        </div>
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Descrizione</th>
                                    <td>{servizio.descrizione || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Tariffa</th>
                                    <td>{servizio.tariffa || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tabs-container">
                        <div className="tabs">
                            {[
                                { id: 'lettura', label: 'Lettura' },
                                { id: 'articolo', label: 'Articolo' },
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
                        <div className={`tab-content ${activeTab === 'lettura' ? 'show' : ''}`}>
                            {activeTab === 'lettura' && (
                                <div className="lettura-box">
                                    <button onClick={fetchLettura} className="btn btn-show-lettura">
                                        Visualizza Letture
                                    </button>
                                    <button onClick={() => setAssociatingLettura(true)} className="btn btn-associate-lettura">
                                        Associa Lettura
                                    </button>
                                    <button onClick={() => setCreatingLettura(true)} className="btn btn-create-lettura">
                                        Crea Lettura
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={`tab-content ${activeTab === 'articolo' ? 'show' : ''}`}>
                            {activeTab === 'articolo' && (
                                <div className="articolo-box">
                                    <button onClick={fetchArticolo} className="btn btn-show-articolo">
                                        Visualizza Articoli
                                    </button>
                                    <button onClick={() => setAssociatingArticolo(true)} className="btn btn-associate-articolo">
                                        Associa Articolo
                                    </button>
                                    <button onClick={() => setCreatingArticolo(true)} className="btn btn-create-articolo">
                                        Crea Articolo
                                    </button>
                                </div>
                            )}
                        </div>
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
                                        Crea Fattura
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

            {showLettura && lettura && (
                <div className="lettura-section">
                    <h3>Lettura Associata</h3>
                    <table className="lettura-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Valore</th>
                                <th>Unita' di misura</th>
                                <th>Fatturata</th>
                                <th>Note</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                        {lettura ? (
                            <tr>
                                <td>{new Date(lettura.data_lettura).toLocaleDateString()}</td>
                                <td>{lettura.consumo}</td>
                                <td>{lettura.unita_misura}</td>
                                <td>
                                    <input type="checkbox" checked={lettura.fatturata} readOnly />
                                </td>
                                <td>{lettura.note || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-edit"
                                        onClick={() => history.push(`/letture/${lettura._id}`)}
                                    >
                                        Apri
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="6">Nessuna lettura associata</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
            {associatingLettura && (
                <LetturaList
                    onSelectLettura={handleAssociaLettura}
                />
                
            )}
            {creatingLettura && (
                <LetturaEditor
                    onSave={handleCreateLettura}
                    onCancel={() => setCreatingLettura(false)}
                    mode="Nuovo"
                />
            )}
            {showArticolo && articolo &&  (
                <div className="articolo-section">
                    <h3>Articolo Associato</h3>
                    <table className="articolo-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Codice</th>
                                <th>Iva</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{articolo.descrizione || 'N/A'}</td>
                                <td>{articolo.codice}</td>
                                <td>{articolo.iva}</td>
                                <td>
                                    <button
                                        className="btn btn-edit"
                                        onClick={() => history.push(`/articoli/${articolo._id}`)}
                                    >
                                        Apri
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {associatingArticolo && (
                <ArticoloList
                    onSelectArticolo={handleAssociaArticolo}
                />
                
            )}
            {creatingArticolo && (
                <ArticoloEditor
                    onSave={handleCreateArticolo}
                    onCancel={() => setCreatingArticolo(false)}
                    mode="Nuovo"
                />
            )}
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
            {associatingFattura && (
                <FatturaList
                    onSelectFattura={handleAssociaFattura}
                />
            )}
            {creatingFattura && (
                <FatturaEditor
                    onSave={handleCreateFattura}
                    onCancel={() => setCreatingFattura(false)}
                    mode="Nuovo"
                />
            )}

        </div>
    );
};

export default ServizioDetails;
