import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import contatoreApi from '../../api/contatoreApi';
import clienteApi from '../../api/clienteApi';
import edificioApi from '../../api/edificioApi';
import listinoApi from '../../api/listinoApi';
import letturaApi from '../../api/letturaApi';
import '../../styles/Contatore/ContatoreDetails.css';
import ContatoreEditor from '../shared/ContatoreEditor'
import ClienteList from '../Cliente/ClienteList';
import ClienteEditor from '../shared/ClienteEditor'
import LetturaList from '../Lettura/LetturaList';
import LetturaEditor from '../shared/LetturaEditor'
import EdificioList from '../Edificio/EdificioList';
import EdificioEditor from '../shared/EdificioEditor'
import ListinoList from '../Listino/ListinoList';
import ListinoEditor from '../shared/ListinoEditor'


const ContatoreDetails = () =>
{
    const { id: contatoreId } = useParams();
    const history = useHistory();
    const [contatore, setContatore] = useState(null);
    const [letture, setLetture] = useState([]);
    const [showLetture, setShowLetture] = useState(false);
    const [associatingLettura, setAssociatingLettura] = useState(false);
    const [creatingLettura, setCreatingLettura] = useState(false);
    const [cliente, setCliente] = useState([]);
    const [showCliente, setShowCliente] = useState(false);
    const [associatingCliente, setAssociatingCliente] = useState(false);
    const [creatingCliente, setCreatingCliente] = useState(false);
    const [edificio, setEdificio] = useState([]);
    const [showEdificio, setShowEdificio] = useState(false);
    const [associatingEdificio, setAssociatingEdificio] = useState(false);
    const [creatingEdificio, setCreatingEdificio] = useState(false);
    const [listino, setListino] = useState([]);
    const [showListiono, setShowListino] = useState(false);
    const [associatingListino, setAssociatingListino] = useState(false);
    const [creatingListino, setCreatingListino] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('modifica');


    const resetViews = () => {
        setLetture([]);
        setShowLetture(false);
        setAssociatingLettura(false);
        setCreatingLettura(false);
        setCliente([]);
        setShowCliente(false);
        setAssociatingCliente(false);
        setCreatingCliente(false);
        setEdificio([]);
        setShowEdificio(false);
        setAssociatingEdificio(false);
        setCreatingEdificio(false);
        setListino([]);
    };
    
    const fetchContatore = useCallback(async () => {
        console.log("fetchContatore called with ID:", contatoreId);
        try {
            const response = await contatoreApi.getContatore(contatoreId);
            console.log("API response:", response.data);
            setContatore(response.data);
        } catch (error) {
            console.error("Error in fetchContatore:", error);
        }
    }, [contatoreId]);

    const fetchLetture = async () =>
    {
        try
        {
            const response = await contatoreApi.getLetture(contatoreId);
            setLetture(response.data);
            setShowLetture(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero delle letture');
            console.error(error);
        }
    };

    const handleEditContatore = async (updatedContatore) => {
        try {
            await contatoreApi.updateContatore(contatoreId, updatedContatore);
            setContatore(updatedContatore);
            alert('Contatore aggiornato con successo');
            setIsEditing(false);
        } catch (error) {
            alert('Errore durante l\'aggiornamento del contatore');
            console.error(error);
        }
    };

    const handleDeleteContatore = async () => {
        try {
            if (window.confirm('Sei sicuro di voler cancellare questo contatore?')) {
                await contatoreApi.deleteContatore(contatoreId);
                alert('Contatore cancellato con successo');
                handleBackClick();
            }
        } catch (error) {
            alert('Errore durante la cancellazione del contatore');
            console.error(error);
        }
    };    

    const fetchCliente = async () =>
    {
        try
        {
            const response = await contatoreApi.getCliente(contatoreId);
            setCliente(response.data);
            setShowCliente(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero del cliente');
            console.error(error);
        }
    };

    const handleAssociateCliente = async (clienteId) => {
        try {
            await contatoreApi.associateCliente(contatoreId, clienteId);
            alert('Cliente associato con successo.');
            setAssociatingCliente(false);
        } catch (error) {
            console.error('Errore durante l\'associazione del cliente:', error);
            alert('Errore durante l\'associazione del cliente.');
        }
    };

    const handleCreateCliente = async (newCliente) => {
        try {
            const response = await clienteApi.createCliente(newCliente);
            await contatoreApi.associateCliente(contatoreId, response.data._id);
            alert('Cliente creato e associato con successo');
            setCreatingCliente(false);
            fetchCliente();
        } catch (error) {
            alert('Errore durante la creazione o associazione del cliente');
            console.error(error);
        }
    };

    const handleAssociateLettura = async (letturaId) => {
        try {
            await contatoreApi.associateLettura(contatoreId, letturaId);
            alert('Lettura associato con successo.');
            setAssociatingLettura(false);
        } catch (error) {
            console.error('Errore durante l\'associazione della lettura:', error);
            alert('Errore durante l\'associazione della lettura.');
        }
    };

    const handleCreateLettura = async (newLettura) => {
        try {
            const response = await letturaApi.createLettura(newLettura);
            await contatoreApi.associateLettura(contatoreId, response.data._id);
            alert('Lettura creata e associata con successo');
            setCreatingLettura(false);
            fetchLetture();
        } catch (error) {
            alert('Errore durante la creazione o associazione della lettura');
            console.error(error);
        }
    };

    const fetchEdificio = async () =>
    {
        try
        {
            const response = await contatoreApi.getEdificio(contatoreId);
            setEdificio(response.data);
            setShowEdificio(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero dell\'edificio');
            console.error(error);
        }
    };

    const handleAssociaEdificio = async (edificioId) => {
        try {
            await contatoreApi.associateEdificio(contatoreId, edificioId);
            alert('Edificio associato con successo.');
            setAssociatingEdificio(false);
        } catch (error) {
            console.error('Errore durante l\'associazione dell\'edificio:', error);
            alert('Errore durante l\'associazione dell\'edificio.');
        }
    };

    const handleCreateEdificio = async (newEdificio) => {
        try {
            const response = await edificioApi.createEdificio(newEdificio);
            await contatoreApi.associateEdificio(contatoreId, response.data._id);
            alert('Edificio creato e associato con successo');
            setCreatingEdificio(false);
            fetchEdificio();
        } catch (error) {
            alert('Errore durante la creazione o associazione dell\'edificio');
            console.error(error);
        }
    };

    const fetchListino = async () =>
    {
        try
        {
            const response = await contatoreApi.getListino(contatoreId);
            setListino(response.data);
            setShowListino(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero del listino');
            console.error(error);
        }
    };

    const handleAssociaListino = async (listinoId) => {
        try {
            await contatoreApi.associateListino(contatoreId, listinoId);
            alert('Listino associato con successo.');
            setAssociatingListino(false);
        } catch (error) {
            console.error('Errore durante l\'associazione del listino:', error);
            alert('Errore durante l\'associazione del listino.');
        }
    };
    
    const handleCreateListino = async (newListino) => {
        try {
            const response = await listinoApi.createListino(newListino);
            await contatoreApi.associateListino(contatoreId, response.data._id);
            alert('Listino creato e associato con successo');
            setCreatingListino(false);
            fetchListino();
        } catch (error) {
            alert('Errore durante la creazione o associazione del listino');
            console.error(error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        resetViews();
    };

    const handleBackClick = () => {
        history.goBack(); // Adjust the route as per your Clienti list URL
    };

    useEffect(() =>
    {
        resetViews();
        if (contatoreId) fetchContatore();
    }, [contatoreId, fetchContatore]);

    if (!contatore) 
    {
        return <div>Seleziona un contatore per vedere i dettagli</div>;
    }

    return (
        <div className="contatore-details">
            <h2>Dettagli Contatore</h2>
            {isEditing ? 
            (
                <ContatoreEditor
                    contatore={contatore}
                    onSave={handleEditContatore}
                    onCancel={() => setIsEditing(false)}
                    mode="Modifica" // "Nuovo", "Visualizza", or "Modifica"
                />
            ) : (
                <>
                    <div className="table-container">
                        <div className="search-container">
                            <button onClick={() => setIsEditing(true)} className="btn btn-edit">
                                Modifica
                            </button>
                            <button onClick={handleDeleteContatore} className="btn btn-delete">
                                Cancella
                            </button>
                        </div>
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Tipo Contatore</th>
                                    <td>{contatore.tipo_contatore || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Codice</th>
                                    <td>{contatore.codice || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Nome Cliente</th>
                                    <td>{contatore.nome_cliente || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Seriale Interno</th>
                                    <td>{contatore.seriale_interno || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Nome Edificio</th>
                                    <td>{contatore.nome_edificio || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Tipo Attività</th>
                                    <td>{contatore.tipo_attivita || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Seriale</th>
                                    <td>{contatore.seriale || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Inattivo</th>
                                    <td>{contatore.inattivo ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Consumo</th>
                                    <td>{contatore.consumo || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Subentro</th>
                                    <td>{contatore.subentro ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Sostituzione</th>
                                    <td>{contatore.sostituzione ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Condominiale</th>
                                    <td>{contatore.condominiale ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Inizio</th>
                                    <td>{contatore.inizio ? new Date(contatore.inizio).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Scadenza</th>
                                    <td>{contatore.scadenza ? new Date(contatore.scadenza).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Causale</th>
                                    <td>{contatore.causale || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Note</th>
                                    <td>{contatore.note || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Foto</th>
                                    <td>{contatore.foto || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Listino</th>
                                    <td>{contatore.listino ? contatore.listino.descrizione || 'N/A' : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Cliente</th>
                                    <td>{contatore.cliente ? `${contatore.cliente.nome} ${contatore.cliente.cognome}` : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Edificio</th>
                                    <td>{contatore.edificio ? contatore.edificio.descrizione || 'N/A' : 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                    <div className="tabs-container">
                        {/* Tab Navigation */}
                        <div className="tabs">
                            {[
                                { id: 'cliente', label: 'Cliente' },
                                { id: 'letture', label: 'Letture' },
                                { id: 'edificio', label: 'Edificio' },
                                { id: 'listino', label: 'Listino' },
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
                        <div className={`tab-content ${activeTab === 'cliente' ? 'show' : ''}`}>
                            {activeTab === 'cliente' && (
                                <div className="cliente-box">
                                    <button onClick={fetchCliente} className="btn btn-show-cliente">
                                        Visualizza Cliente
                                    </button>
                                    <button onClick={() => setAssociatingCliente(true)} className="btn btn-associate-cliente">
                                        Associa Cliente
                                    </button>
                                    <button onClick={() => setCreatingCliente(true)} className="btn btn-create-cliente">
                                        Crea Cliente
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={`tab-content ${activeTab === 'letture' ? 'show' : ''}`}>
                            {activeTab === 'letture' && (
                                <div className="letture-box">
                                    <button onClick={fetchLetture} className="btn btn-show-letture">
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
                        <div className={`tab-content ${activeTab === 'edificio' ? 'show' : ''}`}>
                            {activeTab === 'edificio' && (
                                <div className="edificio-box">
                                    <button onClick={fetchEdificio} className="btn btn-show-edificio">
                                        Visualizza Edifico
                                    </button>
                                    <button onClick={() => setAssociatingEdificio(true)} className="btn btn-associate-edificio">
                                        Associa Edificio
                                    </button>
                                    <button onClick={() => setCreatingEdificio(true)} className="btn btn-create-edificio">
                                        Crea Edificio
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={`tab-content ${activeTab === 'listino' ? 'show' : ''}`}>
                            {activeTab === 'listino' && (
                                <div className="listino-box">
                                    <button onClick={fetchListino} className="btn btn-show-listino">
                                        Visualizza Listino
                                    </button>
                                    <button onClick={() => setAssociatingListino(true)} className="btn btn-associate-listino">
                                        Associa Listino
                                    </button>
                                    <button onClick={() => setCreatingListino(true)} className="btn btn-create-listino">
                                        Crea Listino
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
            
            {showCliente && cliente && (
                <div className="cliente-section">
                <h3>Cliente Associato</h3>
                    <table className="cliente-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Cognome</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{cliente.nome}</td>
                                <td>{cliente.cognome}</td>
                                <td>
                                    <button
                                        onClick={() => history.push(`/clienti/${cliente._id}`)}
                                        className="btn btn-open"
                                    >
                                        Apri
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {associatingCliente && (
                <ClienteList
                    onSelectCliente={handleAssociateCliente}
                />
            )}
            {creatingCliente && (
                <ClienteEditor
                    cliente={{
                        contatore: contatore._id,
                    }}
                    onSave={handleCreateCliente}
                    onCancel={() => setCreatingCliente(false)}
                    mode="Nuovo"
                />
            )}
            {showLetture && Array.isArray(letture) && letture.length > 0 && (
                <div className="letture-section">
                    <h3>Letture Associate</h3>
                    <table className="letture-table">
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
                            {
                                letture.map((lettura) => (
                                    <tr key={lettura._id}>
                                        <td>{new Date(lettura.data_lettura).toLocaleDateString()}</td>
                                        <td>{lettura.consumo}</td>
                                        <td>{lettura.unita_misura}</td>
                                        <td><input type="checkbox" checked={lettura.fatturata} readOnly /></td>
                                        <td>{lettura.note}</td>
                                        <td>
                                            <button
                                                onClick={() => history.push(`/letture/${lettura._id}`)}
                                                className="btn btn-open"
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
            {associatingLettura && (
                <LetturaList
                    onSelectLettura={handleAssociateLettura}
                />
            )}
            {creatingLettura && (
                <LetturaEditor
                    lettura={{
                        contatore: contatore._id,
                    }}
                    onSave={handleCreateLettura}
                    onCancel={() => setCreatingLettura(false)}
                    mode="Nuovo"
                />
            )}
            {showEdificio && edificio && (
                <div className="edificio-section">
                <h3>Edificio Associato</h3>
                    <table className="edificio-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{edificio.descrizione}</td>
                                <td>
                                    <button
                                        onClick={() => history.push(`/edifici/${edificio._id}`)}
                                        className="btn btn-open"
                                    >
                                        Apri
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {associatingEdificio && (
                <EdificioList
                    onSelectEdificio={handleAssociaEdificio}
                />
            )}
            {creatingEdificio && (
                <EdificioEditor
                    onSave={handleCreateEdificio}
                    onCancel={() => setCreatingEdificio(false)}
                    mode="Nuovo"
                />
            )}
            {showListiono && listino && (
                <div className="listino-section">
                <h3>Listino Associato</h3>
                    <table className="listino-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Categoria</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{listino.descrizione}</td>
                                <td>{listino.categoria}</td>
                                <td>
                                    <button
                                        onClick={() => history.push(`/listini/${listino._id}`)}
                                        className="btn btn-open"
                                    >
                                        Apri
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {associatingListino && (
                <ListinoList
                    onSelectListino={handleAssociaListino}
                />
            )}
            {creatingListino && (
                <ListinoEditor
                    onSave={handleCreateListino}
                    onCancel={() => setCreatingListino(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default ContatoreDetails;