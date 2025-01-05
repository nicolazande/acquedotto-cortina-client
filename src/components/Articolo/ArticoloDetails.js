import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import servizioApi from '../../api/servizioApi';
import articoloApi from '../../api/articoloApi';
import '../../styles/Articolo/ArticoloDetails.css';
import ServizioEditor from '../shared/ServizioEditor';
import ServizioList from '../Servizio/ServizioList';


const ArticoloDetails = () => {
    const { id: articoloId } = useParams();
    const history = useHistory();
    const [articolo, setArticolo] = useState(null);
    const [servizi, setServizi] = useState([]);
    const [showServizi, setShowServizi] = useState(false);
    const [associatingServizio, setAssociatingServizio] = useState(false);
    const [creatingServizio, setCreatingServizio] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');
    const [isEditing, setIsEditing] = useState(false);


    const resetViews = () => {
        setServizi([]);
        setShowServizi(false);
        setAssociatingServizio(false);
        setCreatingServizio(false);
    };

    const fetchArticolo = useCallback(async () => {
        try {
            const response = await articoloApi.getArticolo(articoloId);
            setArticolo(response.data);
            resetViews();
        } catch (error) {
            console.error('Errore durante il recupero dell\'articolo:', error);
            alert('Errore durante il recupero dell\'articolo.');
        }
    }, [articoloId]);

    const handleEditArticolo = async (updatedArticolo) => {
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

    const handleDeleteArticolo = async () => {
        try {
            if (window.confirm('Sei sicuro di voler cancellare questo articolo?')) {
                await articoloApi.deleteArticolo(articoloId);
                alert('Articolo cancellato con successo');
                handleBackClick();
            }
        } catch (error) {
            alert('Errore durante la cancellazione dell\'articolo');
            console.error(error);
        }
    };    

    const fetchServizi = async () => {
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
            setAssociatingServizio(false);
            fetchServizi();
        } catch (error) {
            console.error('Errore durante l\'associazione del servizio:', error);
            alert('Errore durante l\'associazione del servizio.');
        }
    };

    const handleCreateServizio = async (newServizio) => {
        try {
            const response = await servizioApi.createServizio(newServizio);
            await articoloApi.associateServizio(articoloId, response.data._id);
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
        if (articoloId) fetchArticolo();
    }, [articoloId, fetchArticolo]);

    if (!articolo) {
        return <div>Seleziona un articolo per vedere i dettagli...</div>;
    }

    return (
        <div className="articolo-details">
            <h2>Dettagli Articolo</h2>
            {isEditing ? (
                <ServizioEditor
                    servizio={articolo}
                    onSave={handleEditArticolo}
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
                            <button onClick={handleDeleteArticolo} className="btn btn-delete">
                                Cancella
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
                        {/* Tab Navigation */}
                        <div className="tabs">
                            {[
                                { id: 'servizi', label: 'Servizi' },
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
                                    <button onClick={fetchServizi} className="btn btn-show-servizi">
                                        Visualizza Servizi
                                    </button>
                                    <button onClick={() => setAssociatingServizio(true)} className="btn btn-associate-servizio">
                                        Associa Servizio
                                    </button>
                                    <button onClick={() => setCreatingServizio(true)} className="btn btn-create-servizio">
                                        Crea Servizio
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

            {showServizi && Array.isArray(servizi) && servizi.length > 0 && (
                <div className="servizi-section">
                    <h3>Servizi Associati</h3>
                    <table className="servizi-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Data Lettura</th>
                                <th>Valore unitario</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                servizi.map((servizio) => (
                                    <tr key={servizio._id}>
                                        <td>{servizio.descrizione}</td>
                                        <td>{new Date(servizio.data_lettura).toLocaleDateString()}</td>
                                        <td>{servizio.valore_unitario.toFixed(2)} €</td>
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
                            }
                        </tbody>
                    </table>
                </div>
            )}
            {associatingServizio && (
                <ServizioList
                    onSelectServizio={handleAssociaServizio}
                />
            )}
            {creatingServizio && (
                <ServizioEditor
                    servizio={{
                        articolo: articolo._id,
                    }}
                    onSave={handleCreateServizio}
                    onCancel={() => setCreatingServizio(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default ArticoloDetails;
