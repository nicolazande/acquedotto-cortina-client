import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import servizioApi from '../../api/servizioApi';
import letturaApi from '../../api/letturaApi';
import articoloApi from '../../api/articoloApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Servizio/ServizioDetails.css';
import ServizioEditor from '../shared/ServizioEditor';
import LetturaList from '../Lettura/LetturaList';
import ArticoloList from '../Articolo/ArticoloList';
import FatturaList from '../Fattura/FatturaList';

const ServizioDetails = () => {
    const { id: servizioId } = useParams();
    const history = useHistory();
    const [servizio, setServizio] = useState(null);
    const [lettura, setLettura] = useState([]);
    const [showLetturaModal, setShowLetturaModal] = useState(false);
    const [showLettura, setShowLettura] = useState(false);
    const [articolo, setArticolo] = useState([]);
    const [showArticolo, setShowArticolo] = useState(false);
    const [showArticoloModal, setShowArticoloModal] = useState(false);
    const [fattura, setFattura] = useState([]);
    const [showFattura, setShowFattura] = useState(false);
    const [showFatturaModal, setShowFatturaModal] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);
    
    const fetchServizio = useCallback(async () => {
        try {
            const response = await servizioApi.getServizio(servizioId);
            setServizio(response.data);
        } catch (error) {
            console.error('Errore durante il recupero del servizio:', error);
            alert('Errore durante il recupero del servizio.');
        }
    }, [servizioId]);

    useEffect(() => {
        if (servizioId) fetchServizio();
    }, [servizioId, fetchServizio]);

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

    const handleAssociaLettura = async (letturaId) => {
        try {
            await servizioApi.associateLettura(servizioId, letturaId);
            alert('Lettura associata con successo.');
            setShowLetturaModal(false);
        } catch (error) {
            console.error('Errore durante l\'associazione della lettura:', error);
            alert('Errore durante l\'associazione della lettura.');
        }
    };

    const handleAssociaArticolo = async (articoloId) => {
        try {
            await servizioApi.associateArticolo(servizioId, articoloId);
            alert('Articolo associato con successo.');
            setShowLetturaModal(false);
        } catch (error) {
            console.error('Errore durante l\'associazione dell\'articolo:', error);
            alert('Errore durante l\'associazione dell\'articolo.');
        }
    };

    const handleAssociaFattura = async (fatturaId) => {
        try {
            await servizioApi.associateFattura(servizioId, fatturaId);
            alert('Fattura associata con successo.');
            setShowFatturaModal(false);
        } catch (error) {
            console.error('Errore durante l\'associazione della fattura:', error);
            alert('Errore durante l\'associazione della fattura.');
        }
    };

    const handleSaveServizio = async (updatedServizio) => {
        try {
            await servizioApi.updateServizio(servizioId, updatedServizio);
            setServizio(updatedServizio);
            setIsEditing(false);
            alert('Servizio aggiornato con successo.');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento del servizio:', error);
            alert('Errore durante l\'aggiornamento del servizio.');
        }
    };

    const handleBackClick = () => {
        history.goBack();
    };

    if (!servizio) {
        return <div>Seleziona un servizio per vedere i dettagli...</div>;
    }

    return (
        <div className="servizio-details">
            <h2>Dettagli Servizio</h2>
            {isEditing ? (
                <ServizioEditor
                    servizio={servizio}
                    onSave={handleSaveServizio}
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
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {activeTab === 'lettura' && (
                            <div className="lettura-box">
                                <button onClick={fetchLettura} className="btn btn-show-lettura">
                                    Visualizza Letture
                                </button>
                                <button onClick={() => setShowLetturaModal(true)} className="btn btn-associate-lettura">
                                    Associa Lettura
                                </button>
                            </div>
                        )}
                        {activeTab === 'articolo' && (
                            <div className="articolo-box">
                                <button onClick={fetchArticolo} className="btn btn-show-articolo">
                                    Visualizza Articoli
                                </button>
                                <button onClick={() => setShowArticoloModal(true)} className="btn btn-associate-articolo">
                                    Associa Articolo
                                </button>
                            </div>
                        )}
                        {activeTab === 'fattura' && (
                            <div className="fattura-box">
                                <button onClick={fetchFattura} className="btn btn-show-fattura">
                                    Visualizza Fattura
                                </button>
                                <button onClick={() => setShowFatturaModal(true)} className="btn btn-associate-fattura">
                                    Associa Fattura
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={handleBackClick} className="btn btn-back">Indietro</button>
            </div>
            {showLettura && (
                <div className="lettura-section">
                    <h3>Lettura Associata</h3>
                    <table className="lettura-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Valore</th>
                                <th>UdM</th>
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
            {showLetturaModal && (
                <LetturaList
                    onSelectLettura={handleAssociaLettura}
                />
                
            )}
            {showArticolo && articolo && (
                <div className="articolo-section">
                    <h3>Articolo Associato</h3>
                    <table className="articolo-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Prezzo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{articolo.descrizione || 'N/A'}</td>
                                <td>{articolo.prezzo?.toFixed(2) || '0.00'}</td>
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
            {showArticoloModal && (
                <ArticoloList
                    onSelectArticolo={handleAssociaArticolo}
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
            {showFatturaModal && (
                <FatturaList
                    onSelectFattura={handleAssociaFattura}
                />
            )}

        </div>
    );
};

export default ServizioDetails;
