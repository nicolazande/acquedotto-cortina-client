import React, { useEffect, useState } from 'react';
import contatoreApi from '../../api/contatoreApi';
import clienteApi from '../../api/clienteApi';
import edificioApi from '../../api/edificioApi';
import listinoApi from '../../api/listinoApi';
import letturaApi from '../../api/letturaApi';
import '../../styles/Contatore/ContatoreDetails.css';

const ContatoreDetails = ({ contatoreId, onDeselectContatore }) => {
    const [contatore, setContatore] = useState(null);
    const [letture, setLetture] = useState([]);
    const [showLetture, setShowLetture] = useState(false);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showEdificioModal, setShowEdificioModal] = useState(false);
    const [showListinoModal, setShowListinoModal] = useState(false);
    const [showLetturaModal, setShowLetturaModal] = useState(false);

    const [clienti, setClienti] = useState([]);
    const [edifici, setEdifici] = useState([]);
    const [listini, setListini] = useState([]);
    const [lettureList, setLettureList] = useState([]);

    useEffect(() => {
        const fetchContatore = async () => {
            try {
                const response = await contatoreApi.getContatore(contatoreId);
                setContatore(response.data);
            } catch (error) {
                alert('Errore durante il recupero del contatore');
                console.error(error);
            }
        };

        if (contatoreId) {
            fetchContatore();
        }

        setShowClienteModal(false);
        setShowEdificioModal(false);
        setShowListinoModal(false);
        setShowLetturaModal(false);
    }, [contatoreId]);

    const fetchLetture = async () => {
        try {
            const response = await contatoreApi.getLetture(contatoreId);
            setLetture(response.data);
            setShowLetture(true);
        } catch (error) {
            alert('Errore durante il recupero delle letture');
            console.error(error);
        }
    };

    const handleOpenClienteModal = async () => {
        try {
            const response = await clienteApi.getClienti();
            setClienti(response.data);
            setShowClienteModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei clienti');
            console.error(error);
        }
    };

    const handleOpenEdificioModal = async () => {
        try {
            const response = await edificioApi.getEdifici();
            setEdifici(response.data);
            setShowEdificioModal(true);
        } catch (error) {
            alert('Errore durante il recupero degli edifici');
            console.error(error);
        }
    };

    const handleOpenListinoModal = async () => {
        try {
            const response = await listinoApi.getListini();
            setListini(response.data);
            setShowListinoModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei listini');
            console.error(error);
        }
    };

    const handleOpenLetturaModal = async () => {
        try {
            const response = await letturaApi.getLetture();
            setLettureList(response.data);
            setShowLetturaModal(true);
        } catch (error) {
            alert('Errore durante il recupero delle letture');
            console.error(error);
        }
    };

    const handleSelectCliente = async (clienteId) => {
        try {
            await contatoreApi.associateCliente(contatoreId, clienteId);
            setShowClienteModal(false);
            setContatore((prevData) => ({ ...prevData, cliente: { _id: clienteId } }));
        } catch (error) {
            alert('Errore durante l\'associazione del cliente');
            console.error(error);
        }
    };

    const handleSelectEdificio = async (edificioId) => {
        try {
            await contatoreApi.associateEdificio(contatoreId, edificioId);
            setShowEdificioModal(false);
            setContatore((prevData) => ({ ...prevData, edificio: { _id: edificioId } }));
        } catch (error) {
            alert('Errore durante l\'associazione dell\'edificio');
            console.error(error);
        }
    };

    const handleSelectListino = async (listinoId) => {
        try {
            await contatoreApi.associateListino(contatoreId, listinoId);
            setShowListinoModal(false);
            setContatore((prevData) => ({ ...prevData, listino: { _id: listinoId } }));
        } catch (error) {
            alert('Errore durante l\'associazione del listino');
            console.error(error);
        }
    };

    const handleSelectLettura = async (letturaId) => {
        try {
            await contatoreApi.associateLettura(contatoreId, letturaId);
            setShowLetturaModal(false);
            fetchLetture();
        } catch (error) {
            alert('Errore durante l\'associazione della lettura');
            console.error(error);
        }
    };

    if (!contatore) {
        return <div>Seleziona un contatore per vedere i dettagli</div>;
    }

    return (
        <div className="contatore-detail">
            <h2>Dettagli Contatore</h2>
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
                </tbody>
            </table>
            <div className="btn-container">
                <button onClick={fetchLetture} className="btn btn-show-letture">Visualizza Letture</button>
                <button onClick={handleOpenClienteModal} className="btn btn-associate-cliente">Associa Cliente</button>
                <button onClick={handleOpenEdificioModal} className="btn btn-associate-edificio">Associa Edificio</button>
                <button onClick={handleOpenListinoModal} className="btn btn-associate-listino">Associa Listino</button>
                <button onClick={handleOpenLetturaModal} className="btn btn-associate-lettura">Associa Lettura</button>
            </div>
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
                            {letture.map((lettura) => (
                                <tr key={lettura._id}>
                                    <td>{new Date(lettura.data).toLocaleDateString()}</td>
                                    <td>{lettura.valore}</td>
                                    <td>{lettura.UdM}</td>
                                    <td><input type="checkbox" checked={lettura.fatturata} readOnly /></td>
                                    <td>{lettura.note}</td>
                                </tr>
                            ))}
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
                        <button onClick={() => setShowClienteModal(false)}>Chiudi</button>
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
                        <button onClick={() => setShowEdificioModal(false)}>Chiudi</button>
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
                        <button onClick={() => setShowListinoModal(false)}>Chiudi</button>
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
                        <button onClick={() => setShowLetturaModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContatoreDetails;