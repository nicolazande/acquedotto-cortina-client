import React, { useEffect, useState, useCallback } from 'react';
import contatoreApi from '../../api/contatoreApi';
import clienteApi from '../../api/clienteApi';
import edificioApi from '../../api/edificioApi';
import listinoApi from '../../api/listinoApi';
import letturaApi from '../../api/letturaApi';
import '../../styles/Contatore/ContatoreDetails.css';
import ContatoreEditor from '../shared/ContatoreEditor'

const ContatoreDetails = ({ contatoreId, onDeselectContatore }) =>
{
    const [contatore, setContatore] = useState(null);
    const [letture, setLetture] = useState([]);
    const [showLetture, setShowLetture] = useState(false);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showEdificioModal, setShowEdificioModal] = useState(false);
    const [showListinoModal, setShowListinoModal] = useState(false);
    const [showLetturaModal, setShowLetturaModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        seriale: '',
        serialeInterno: '',
        ultimaLettura: '',
        attivo: true,
        condominiale: false,
        sostituzione: false,
        subentro: false,
        dataInstallazione: '',
        dataScadenza: '',
        foto: '',
        note: '',
    });

    const [clienti, setClienti] = useState([]);
    const [edifici, setEdifici] = useState([]);
    const [listini, setListini] = useState([]);
    const [lettureList, setLettureList] = useState([]);

    const fetchContatore = useCallback(async () =>
    {
        try
        {
            const response = await contatoreApi.getContatore(contatoreId);
            setContatore(response.data);
            setEditFormData(
            {
                seriale: response.data.seriale,
                serialeInterno: response.data.serialeInterno,
                ultimaLettura: response.data.ultimaLettura,
                attivo: response.data.attivo,
                condominiale: response.data.condominiale,
                sostituzione: response.data.sostituzione,
                subentro: response.data.subentro,
                dataInstallazione: response.data.dataInstallazione,
                dataScadenza: response.data.dataScadenza,
                foto: response.data.foto,
                note: response.data.note,
            });
        }
        catch (error)
        {
            alert('Errore durante il recupero del contatore');
            console.error(error);
        }
    }, [contatoreId]);

    useEffect(() =>
    {
        if (contatoreId)
        {
            fetchContatore();
        }
        setShowClienteModal(false);
        setShowEdificioModal(false);
        setShowListinoModal(false);
        setShowLetturaModal(false);
    }, [contatoreId, fetchContatore]);

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

    const handleOpenClienteModal = async () =>
    {
        try
        {
            const response = await clienteApi.getClienti();
            setClienti(response.data);
            setShowClienteModal(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero dei clienti');
            console.error(error);
        }
    };

    const handleOpenEdificioModal = async () =>
    {
        try
        {
            const response = await edificioApi.getEdifici();
            setEdifici(response.data);
            setShowEdificioModal(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero degli edifici');
            console.error(error);
        }
    };

    const handleOpenListinoModal = async () =>
    {
        try
        {
            const response = await listinoApi.getListini();
            setListini(response.data);
            setShowListinoModal(true);
        }
        catch (error)
        {
            alert('Errore durante il recupero dei listini');
            console.error(error);
        }
    };

    const handleOpenLetturaModal = async () =>
    {
        try 
        {
            const response = await letturaApi.getLetture();
            setLettureList(response.data);
            setShowLetturaModal(true);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero delle letture');
            console.error(error);
        }
    };

    const handleSelectCliente = async (clienteId) => 
    {
        try 
        {
            await contatoreApi.associateCliente(contatoreId, clienteId);
            setShowClienteModal(false);
            fetchContatore(); // Aggiorna i dettagli del contatore
        } 
        catch (error)
        {
            alert('Errore durante l\'associazione del cliente');
            console.error(error);
        }
    };

    const handleSelectEdificio = async (edificioId) => 
    {
        try 
        {
            await contatoreApi.associateEdificio(contatoreId, edificioId);
            setShowEdificioModal(false);
            fetchContatore(); // Aggiorna i dettagli del contatore
        } 
        catch (error) 
        {
            alert('Errore durante l\'associazione dell\'edificio');
            console.error(error);
        }
    };

    const handleSelectListino = async (listinoId) => 
    {
        try 
        {
            await contatoreApi.associateListino(contatoreId, listinoId);
            setShowListinoModal(false);
            fetchContatore(); // Aggiorna i dettagli del contatore
        } 
        catch (error) 
        {
            alert('Errore durante l\'associazione del listino');
            console.error(error);
        }
    };

    const handleSelectLettura = async (letturaId) => 
    {
        try 
        {
            await contatoreApi.associateLettura(contatoreId, letturaId);
            setShowLetturaModal(false);
            fetchLetture();
        } 
        catch (error) 
        {
            alert('Errore durante l\'associazione della lettura');
            console.error(error);
        }
    };

    const handleEditChange = (e) => 
    {
        const { name, value, type, checked } = e.target;
        setEditFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSaveContatore = async (updatedContatore) => {
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
                    onSave={handleSaveContatore}
                    onCancel={() => setIsEditing(false)}
                    mode="Modifica" // "Nuovo", "Visualizza", or "Modifica"
                />
            ) : (
                <>
                    <div className="table-container">
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Seriale</th>
                                    <td>{contatore.seriale}</td>
                                </tr>
                                <tr>
                                    <th>Seriale Interno</th>
                                    <td>{contatore.serialeInterno}</td>
                                </tr>
                                <tr>
                                    <th>Ultima Lettura</th>
                                    <td>{new Date(contatore.ultimaLettura).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <th>Attivo</th>
                                    <td>{contatore.attivo ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Condominiale</th>
                                    <td>{contatore.condominiale ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Sostituzione</th>
                                    <td>{contatore.sostituzione ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Subentro</th>
                                    <td>{contatore.subentro ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Data Installazione</th>
                                    <td>{new Date(contatore.dataInstallazione).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <th>Data Scadenza</th>
                                    <td>{new Date(contatore.dataScadenza).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <th>Note</th>
                                    <td>{contatore.note}</td>
                                </tr>
                                <tr>
                                    <th>Cliente</th>
                                    <td>{contatore.cliente ? `${contatore.cliente.nome} ${contatore.cliente.cognome}` : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Edificio</th>
                                    <td>{contatore.edificio ? contatore.edificio.descrizione : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Listino</th>
                                    <td>{contatore.listino ? contatore.listino.descrizione : 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="btn-container">
                        <button onClick={fetchLetture} className="btn btn-show-letture">Visualizza Letture</button>
                        <button onClick={handleOpenClienteModal} className="btn btn-associate-cliente">Associa Cliente</button>
                        <button onClick={handleOpenEdificioModal} className="btn btn-associate-edificio">Associa Edificio</button>
                        <button onClick={handleOpenListinoModal} className="btn btn-associate-listino">Associa Listino</button>
                        <button onClick={handleOpenLetturaModal} className="btn btn-associate-lettura">Associa Lettura</button>
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">Modifica</button>
                    </div>
                </>
            )}
            <div className="btn-back-container">
                <button onClick={onDeselectContatore} className="btn btn-back">Indietro</button>
            </div>
            {showLetture && (
                <div className="letture-section">
                    <h3>Letture Associate</h3>
                    <table className="letture-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Valore</th>
                                <th>UdM</th>
                                <th>Fatturata</th>
                                <th>Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {letture.length === 0 ? (
                                <tr>
                                    <td colSpan="5">Nessuna lettura associata</td>
                                </tr>
                            ) : (
                                letture.map((lettura) => (
                                    <tr key={lettura._id}>
                                        <td>{new Date(lettura.data).toLocaleDateString()}</td>
                                        <td>{lettura.valore}</td>
                                        <td>{lettura.UdM}</td>
                                        <td><input type="checkbox" checked={lettura.fatturata} readOnly /></td>
                                        <td>{lettura.note}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {showClienteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Cliente</h3>
                        <ul>
                            {clienti.map((cliente) => (
                                <li key={cliente._id} onClick={() => handleSelectCliente(cliente._id)}>
                                    {cliente.nome} {cliente.cognome}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {showEdificioModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Edificio</h3>
                        <ul>
                            {edifici.map((edificio) => (
                                <li key={edificio._id} onClick={() => handleSelectEdificio(edificio._id)}>
                                    {edificio.descrizione}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {showListinoModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Listino</h3>
                        <ul>
                            {listini.map((listino) => (
                                <li key={listino._id} onClick={() => handleSelectListino(listino._id)}>
                                    {listino.descrizione}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {showLetturaModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Lettura</h3>
                        <ul>
                            {lettureList.map((lettura) => (
                                <li key={lettura._id} onClick={() => handleSelectLettura(lettura._id)}>
                                    {new Date(lettura.data).toLocaleDateString()} - {lettura.valore} {lettura.UdM}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContatoreDetails;