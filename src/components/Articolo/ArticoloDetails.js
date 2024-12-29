import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import servizioApi from '../../api/servizioApi';
import articoloApi from '../../api/articoloApi';
import '../../styles/Articolo/ArticoloDetails.css';
import ServizioEditor from '../shared/ServizioEditor';
import ArticoloList from '../Articolo/ArticoloList';
import ServizioList from '../Servizio/ServizioList';


const ArticoloDetails = () => {
    const { id: articoloId } = useParams();
    const history = useHistory();
    const [articolo, setArticolo] = useState(null);
    const [servizi, setServizi] = useState([]);
    const [showServizi, setShowServizi] = useState(false);
    const [showServiziModal, setShowServizioModal] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);

    const fetchArticolo = useCallback(async () => {
        try {
            const response = await articoloApi.getArticolo(articoloId);
            setArticolo(response.data);
        } catch (error) {
            console.error('Errore durante il recupero dell\'articolo:', error);
            alert('Errore durante il recupero dell\'articolo.');
        }
    }, [articoloId]);

    useEffect(() => {
        if (articoloId) fetchArticolo();
    }, [articoloId, fetchArticolo]);

    const fetchServiziAssociati = async () => {
        try {
            const response = await articoloApi.getServizi(articoloId);
            setServizi(response.data);
            setShowServizi(true);
        } catch (error) {
            console.error('Errore durante il recupero dei servizi:', error);
            alert('Errore durante il recupero dei servizi.');
        }
    };

    const handleAssociaServizio = async (servizioId) => {
        try {
            await articoloApi.associateServizio(articoloId, servizioId);
            alert('Servizio associato con successo.');
            setShowServizioModal(false);
        } catch (error) {
            console.error('Errore durante l\'associazione del servizio:', error);
            alert('Errore durante l\'associazione del servizio.');
        }
    };

    const handleSaveArticolo = async (updatedArticolo) => {
        try {
            await articoloApi.updateArticolo(articoloId, updatedArticolo);
            setArticolo(updatedArticolo);
            setIsEditing(false);
            alert('Articolo aggiornato con successo.');
        } catch (error) {
            console.error('Errore durante l\'aggiornamento dell\'articolo:', error);
            alert('Errore durante l\'aggiornamento dell\'articolo.');
        }
    };

    const handleBackClick = () => {
        history.goBack();
    };

    if (!articolo) {
        return <div>Seleziona un articolo per vedere i dettagli...</div>;
    }

    return (
        <div className="articolo-details">
            <h2>Dettagli Articolo</h2>
            {isEditing ? (
                <ServizioEditor
                    servizio={articolo}
                    onSave={handleSaveArticolo}
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
                                    <th>Codice</th>
                                    <td>{articolo.codice || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Descrizione</th>
                                    <td>{articolo.descrizione || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>IVA</th>
                                    <td>{articolo.iva || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tabs-container">
                        <div className="tabs">
                            {[
                                { id: 'servizi', label: 'Servizi' },
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
                        {activeTab === 'servizi' && (
                            <div className="servizi-box">
                                <button onClick={fetchServiziAssociati} className="btn btn-show-servizi">
                                    Visualizza Servizi
                                </button>
                                <button onClick={() => setShowServizioModal(true)} className="btn btn-associate-servizio">
                                    Associa Servizio
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={handleBackClick} className="btn btn-back">Indietro</button>
            </div>
            {showServizi && (
                <div className="servizi-section">
                    <h3>Servizi Associati</h3>
                    <table className="servizi-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Valore</th>
                                <th>Data</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servizi.length === 0 ? (
                                <tr>
                                    <td colSpan="3">Nessun servizio associato</td>
                                </tr>
                            ) : (
                                servizi.map((servizio) => (
                                    <tr key={servizio._id}>
                                        <td>{servizio.descrizione}</td>
                                        <td>{servizio.valore_unitario}</td>
                                        <td>{new Date(servizio.data_lettura).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-view"
                                                onClick={() =>
                                                    history.push(`/servizi/${servizio._id}`)
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
            {showServiziModal && (
                <ServizioList
                    onSelectServizio={handleAssociaServizio}
                />
            )}
        </div>
    );
};

export default ArticoloDetails;
