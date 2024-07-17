import React, { useEffect, useState } from 'react';
import letturaApi from '../../api/letturaApi';
import contatoreApi from '../../api/contatoreApi';
import servizioApi from '../../api/servizioApi';
import '../../styles/Lettura/LetturaDetails.css';

const LetturaDetails = ({ letturaId, onDeselectLettura }) => {
    const [lettura, setLettura] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [servizi, setServizi] = useState([]);
    const [showContatoreModal, setShowContatoreModal] = useState(false);
    const [showServizioModal, setShowServizioModal] = useState(false);
    const [showServizi, setShowServizi] = useState(false);

    useEffect(() => {
        const fetchLettura = async () => {
            try {
                const response = await letturaApi.getLettura(letturaId);
                setLettura(response.data);
                const contatoreResponse = response.data.contatore;
                if (contatoreResponse) {
                    setContatori([contatoreResponse]);
                }
                const serviziResponse = await letturaApi.getServizi(letturaId);
                setServizi(serviziResponse.data);
            } catch (error) {
                alert('Errore durante il recupero della lettura');
                console.error(error);
            }
        };

        if (letturaId) {
            fetchLettura();
        }

        setShowContatoreModal(false);
        setShowServizioModal(false);
        setShowServizi(false);
    }, [letturaId]);

    const handleOpenContatoreModal = async () => {
        try {
            const response = await contatoreApi.getContatori();
            setContatori(response.data);
            setShowContatoreModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleOpenServizioModal = async () => {
        try {
            const response = await servizioApi.getServizi();
            setServizi(response.data);
            setShowServizioModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei servizi');
            console.error(error);
        }
    };

    const handleSelectContatore = async (contatoreId) => {
        try {
            await letturaApi.associateContatore(letturaId, contatoreId);
            setShowContatoreModal(false);
            const response = await contatoreApi.getContatore(contatoreId);
            setContatori([response.data]);
        } catch (error) {
            alert('Errore durante l\'associazione del contatore');
            console.error(error);
        }
    };

    const handleSelectServizio = async (servizioId) => {
        try {
            await letturaApi.associateServizio(letturaId, servizioId);
            setShowServizioModal(false);
            const response = await letturaApi.getServizi(letturaId);
            setServizi(response.data);
        } catch (error) {
            alert('Errore durante l\'associazione del servizio');
            console.error(error);
        }
    };

    const fetchServiziAssociati = async () => {
        try {
            const response = await letturaApi.getServizi(letturaId);
            setServizi(response.data);
            setShowServizi(true);
        } catch (error) {
            alert('Errore durante il recupero dei servizi');
            console.error(error);
        }
    };

    if (!lettura) {
        return <div>Caricamento...</div>;
    }

    return (
        <div className="lettura-detail">
            <h2>Dettagli Lettura</h2>
            <table className="info-table">
                <tbody>
                    <tr>
                        <th>Cliente</th>
                        <td>{lettura.cliente}</td>
                    </tr>
                    <tr>
                        <th>Tipo</th>
                        <td>{lettura.tipo}</td>
                    </tr>
                    <tr>
                        <th>Data</th>
                        <td>{new Date(lettura.data).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <th>Valore</th>
                        <td>{lettura.valore}</td>
                    </tr>
                    <tr>
                        <th>UdM</th>
                        <td>{lettura.UdM}</td>
                    </tr>
                    <tr>
                        <th>Fatturata</th>
                        <td>{lettura.fatturata ? 'Si' : 'No'}</td>
                    </tr>
                    <tr>
                        <th>Note</th>
                        <td>{lettura.note}</td>
                    </tr>
                    <tr>
                        <th>Contatore</th>
                        <td>{contatori.length > 0 ? contatori[0].seriale : 'N/A'}</td>
                    </tr>
                </tbody>
            </table>

            <div className="btn-container">
                <button onClick={fetchServiziAssociati} className="btn btn-show-servizi">Visualizza Servizi</button>
                <button onClick={handleOpenContatoreModal} className="btn btn-associate-contatore">Associa Contatore</button>
                <button onClick={handleOpenServizioModal} className="btn btn-associate-servizio">Associa Servizio</button>
            </div>
            <div className="btn-back-container">
                <button onClick={onDeselectLettura} className="btn btn-back">Indietro</button>
            </div>

            {showServizi && (
                <div className="servizi-section">
                    <h3>Servizi Associati</h3>
                    <table className="servizi-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Valore</th>
                                <th>Tariffa</th>
                                <th>m3</th>
                                <th>Prezzo</th>
                                <th>Seriale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servizi.length === 0 ? (
                                <tr>
                                    <td colSpan="6">Nessun servizio associato</td>
                                </tr>
                            ) : (
                                servizi.map((servizio) => (
                                    <tr key={servizio._id}>
                                        <td>{servizio.descrizione}</td>
                                        <td>{servizio.valore}</td>
                                        <td>{servizio.tariffa}</td>
                                        <td>{servizio.m3}</td>
                                        <td>{servizio.prezzo}</td>
                                        <td>{servizio.seriale}</td>
                                    </tr>
                                ))
                            )}
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
            {showServizioModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Servizio</h3>
                        <ul>
                            {servizi.map((servizio) => (
                                <li key={servizio._id} onClick={() => handleSelectServizio(servizio._id)}>
                                    {servizio.descrizione}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowServizioModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LetturaDetails;