import React, { useEffect, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import contatoreApi from '../../api/contatoreApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Cliente/ClienteDetails.css';

const ClienteDetails = ({ clienteId, onDeselectCliente }) => {
    const [cliente, setCliente] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [fatture, setFatture] = useState([]);
    const [showContatori, setShowContatori] = useState(false);
    const [showFatture, setShowFatture] = useState(false);
    const [showContatoreModal, setShowContatoreModal] = useState(false);
    const [showFatturaModal, setShowFatturaModal] = useState(false);

    useEffect(() => {
        const fetchCliente = async () => {
            try {
                const response = await clienteApi.getCliente(clienteId);
                setCliente(response.data);
                setShowContatori(false);
                setShowFatture(false);
            } catch (error) {
                alert('Errore durante il recupero del cliente');
                console.error(error);
            }
        };

        if (clienteId) {
            fetchCliente();
        }

        // Chiudi le modali quando cambia il cliente selezionato
        setShowContatoreModal(false);
        setShowFatturaModal(false);
    }, [clienteId]);

    const fetchContatori = async () => {
        try {
            const response = await clienteApi.getContatori(clienteId);
            setContatori(response.data);
            setShowContatori(true);
            setShowFatture(false);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const fetchFatture = async () => {
        try {
            const response = await clienteApi.getFatture(clienteId);
            setFatture(response.data);
            setShowFatture(true);
            setShowContatori(false);
        } catch (error) {
            alert('Errore durante il recupero delle fatture');
            console.error(error);
        }
    };

    const handleOpenContatoreModal = async () => {
        try {
            const response = await contatoreApi.getContatori();
            setContatori(response.data);
            setShowContatoreModal(true);
            setShowFatturaModal(false);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleOpenFatturaModal = async () => {
        try {
            const response = await fatturaApi.getFatture();
            setFatture(response.data);
            setShowFatturaModal(true);
            setShowContatoreModal(false);
        } catch (error) {
            alert('Errore durante il recupero delle fatture');
            console.error(error);
        }
    };

    const handleSelectContatore = async (contatoreId) => {
        try {
            await clienteApi.associateContatore(clienteId, contatoreId);
            setShowContatoreModal(false);
            fetchContatori();
        } catch (error) {
            alert('Errore durante l\'associazione del contatore');
            console.error(error);
        }
    };

    const handleSelectFattura = async (fatturaId) => {
        try {
            await clienteApi.associateFattura(clienteId, fatturaId);
            setShowFatturaModal(false);
            fetchFatture();
        } catch (error) {
            alert('Errore durante l\'associazione della fattura');
            console.error(error);
        }
    };

    if (!cliente) {
        return <div>Seleziona un cliente per vedere i dettagli</div>;
    }

    return (
        <div className="cliente-details">
            <h2>Dettagli Cliente</h2>
            <table className="info-table">
                <tbody>
                    {/* ...altri campi del cliente... */}
                </tbody>
            </table>
            <div className="btn-container">
                <button onClick={fetchContatori} className="btn btn-show-contatori">Visualizza Contatori</button>
                <button onClick={fetchFatture} className="btn btn-show-fatture">Visualizza Fatture</button>
                <button onClick={handleOpenContatoreModal} className="btn btn-associate-contatore">Associa Contatore</button>
                <button onClick={handleOpenFatturaModal} className="btn btn-associate-fattura">Associa Fattura</button>
                <button onClick={onDeselectCliente} className="btn btn-back">Indietro</button>
            </div>
            {showContatori && (
                <div className="contatori-section">
                    <h3>Contatori Associati</h3>
                    <table className="contatori-table">
                        <thead>
                            <tr>
                                <th>Seriale</th>
                                <th>Seriale Interno</th>
                                <th>Ultima Lettura</th>
                                <th>Inattivo</th>
                                <th>Condominiale</th>
                                <th>Sostituzione</th>
                                <th>Subentro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contatori.map((contatore) => (
                                <tr key={contatore._id}>
                                    <td>{contatore.seriale}</td>
                                    <td>{contatore.serialeInterno}</td>
                                    <td>{new Date(contatore.ultimaLettura).toLocaleDateString()}</td>
                                    <td><input type="checkbox" checked={!contatore.attivo} readOnly /></td>
                                    <td><input type="checkbox" checked={contatore.condominiale} readOnly /></td>
                                    <td><input type="checkbox" checked={contatore.sostituzione} readOnly /></td>
                                    <td><input type="checkbox" checked={contatore.subentro} readOnly /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showFatture && (
                <div className="fatture-section">
                    <h3>Fatture Associate</h3>
                    <table className="fatture-table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Ragione Sociale</th>
                                <th>Anno</th>
                                <th>Numero</th>
                                <th>Data</th>
                                <th>Confermata</th>
                                <th>Codice</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fatture.map((fattura) => (
                                <tr key={fattura._id}>
                                    <td>{fattura.tipo}</td>
                                    <td>{fattura.ragioneSociale}</td>
                                    <td>{fattura.anno}</td>
                                    <td>{fattura.numero}</td>
                                    <td>{new Date(fattura.data).toLocaleDateString()}</td>
                                    <td><input type="checkbox" checked={fattura.confermata} readOnly /></td>
                                    <td>{fattura.codice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showContatoreModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Contatore</h3>
                        <ul>
                            {contatori.map((contatore) => (
                                <li key={contatore._id} onClick={() => handleSelectContatore(contatore._id)}>
                                    {contatore.seriale}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowContatoreModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
            {showFatturaModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Fattura</h3>
                        <ul>
                            {fatture.map((fattura) => (
                                <li key={fattura._id} onClick={() => handleSelectFattura(fattura._id)}>
                                    {fattura.codice}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowFatturaModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClienteDetails;