import React, { useEffect, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import contatoreApi from '../../api/contatoreApi';
import '../../styles/Cliente/ClienteDetails.css';

const ClienteDetails = ({ clienteId }) => {
    const [cliente, setCliente] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [selectedContatore, setSelectedContatore] = useState(null);
    const [showContatori, setShowContatori] = useState(false);

    useEffect(() => {
        const fetchCliente = async () => {
            try {
                const response = await clienteApi.getCliente(clienteId);
                setCliente(response.data);
            } catch (error) {
                alert('Errore durante il recupero del cliente');
                console.error('Fetch cliente error:', error);
            }
        };

        if (clienteId) {
            fetchCliente();
        }
    }, [clienteId]);

    const fetchContatori = async () => {
        try {
            const response = await clienteApi.getContatori(clienteId);
            setContatori(response.data);
            setShowContatori(true);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error('Fetch contatori error:', error);
        }
    };

    const fetchContatoreDetails = async (contatoreId) => {
        try {
            const response = await contatoreApi.getContatore(contatoreId);
            setSelectedContatore(response.data);
        } catch (error) {
            alert('Errore durante il recupero del contatore');
            console.error('Fetch contatore details error:', error);
        }
    };

    if (!cliente) {
        return <div>Seleziona un cliente per vedere i dettagli</div>;
    }

    return (
        <div className="cliente-details">
            <h2>Dettagli Cliente</h2>
            <div className="cliente-info">
                <table className="info-table">
                    <tbody>
                        <tr>
                            <th>Ragione Sociale</th>
                            <td>{cliente.ragioneSociale}</td>
                        </tr>
                        <tr>
                            <th>Nome</th>
                            <td>{cliente.nome}</td>
                        </tr>
                        <tr>
                            <th>Cognome</th>
                            <td>{cliente.cognome}</td>
                        </tr>
                        <tr>
                            <th>Sesso</th>
                            <td>{cliente.sesso}</td>
                        </tr>
                        <tr>
                            <th>Socio</th>
                            <td>{cliente.socio ? 'Sì' : 'No'}</td>
                        </tr>
                        <tr>
                            <th>Data di Nascita</th>
                            <td>{new Date(cliente.dataNascita).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <th>Comune di Nascita</th>
                            <td>{cliente.comuneNascita}</td>
                        </tr>
                        <tr>
                            <th>Provincia di Nascita</th>
                            <td>{cliente.provinciaNascita}</td>
                        </tr>
                        <tr>
                            <th>Indirizzo di Residenza</th>
                            <td>{cliente.indirizzoResidenza}</td>
                        </tr>
                        <tr>
                            <th>Numero Residenza</th>
                            <td>{cliente.numeroResidenza}</td>
                        </tr>
                        <tr>
                            <th>CAP Residenza</th>
                            <td>{cliente.capResidenza}</td>
                        </tr>
                        <tr>
                            <th>Località Residenza</th>
                            <td>{cliente.localitaResidenza}</td>
                        </tr>
                        <tr>
                            <th>Provincia Residenza</th>
                            <td>{cliente.provinciaResidenza}</td>
                        </tr>
                        <tr>
                            <th>Nazione Residenza</th>
                            <td>{cliente.nazioneResidenza}</td>
                        </tr>
                        <tr>
                            <th>Destinazione Fatturazione</th>
                            <td>{cliente.destinazioneFatturazione}</td>
                        </tr>
                        <tr>
                            <th>Indirizzo Fatturazione</th>
                            <td>{cliente.indirizzoFatturazione}</td>
                        </tr>
                        <tr>
                            <th>Numero Fatturazione</th>
                            <td>{cliente.numeroFatturazione}</td>
                        </tr>
                        <tr>
                            <th>CAP Fatturazione</th>
                            <td>{cliente.capFatturazione}</td>
                        </tr>
                        <tr>
                            <th>Località Fatturazione</th>
                            <td>{cliente.localitaFatturazione}</td>
                        </tr>
                        <tr>
                            <th>Provincia Fatturazione</th>
                            <td>{cliente.provinciaFatturazione}</td>
                        </tr>
                        <tr>
                            <th>Nazione Fatturazione</th>
                            <td>{cliente.nazioneFatturazione}</td>
                        </tr>
                        <tr>
                            <th>Codice Fiscale</th>
                            <td>{cliente.codiceFiscale}</td>
                        </tr>
                        <tr>
                            <th>Telefono</th>
                            <td>{cliente.telefono}</td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td>{cliente.email}</td>
                        </tr>
                        <tr>
                            <th>Pagamento</th>
                            <td>{cliente.pagamento}</td>
                        </tr>
                        <tr>
                            <th>Codice Destinatario</th>
                            <td>{cliente.codiceDestinatario}</td>
                        </tr>
                        <tr>
                            <th>Fattura Elettronica</th>
                            <td>{cliente.fatturaElettronica}</td>
                        </tr>
                        <tr>
                            <th>Codice ERP</th>
                            <td>{cliente.codiceERP}</td>
                        </tr>
                        <tr>
                            <th>IBAN</th>
                            <td>{cliente.IBAN}</td>
                        </tr>
                        <tr>
                            <th>Note</th>
                            <td>{cliente.note}</td>
                        </tr>
                        <tr>
                            <th>Quote</th>
                            <td>{cliente.quote}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button onClick={fetchContatori} className="btn-show-contatori">Visualizza Contatori</button>
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
                                <th>Dettagli</th>
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
                                    <td>
                                        <button 
                                            className="btn btn-details"
                                            onClick={() => fetchContatoreDetails(contatore._id)}
                                        >
                                            Dettagli
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {selectedContatore && (
                <div className="contatore-detail">
                    <h3>Dettagli Contatore</h3>
                    <table className="info-table">
                        <tbody>
                            <tr>
                                <th>Seriale</th>
                                <td>{selectedContatore.seriale}</td>
                            </tr>
                            <tr>
                                <th>Seriale Interno</th>
                                <td>{selectedContatore.serialeInterno}</td>
                            </tr>
                            <tr>
                                <th>Ultima Lettura</th>
                                <td>{new Date(selectedContatore.ultimaLettura).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <th>Attivo</th>
                                <td>{selectedContatore.attivo ? 'Sì' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Condominiale</th>
                                <td>{selectedContatore.condominiale ? 'Sì' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Sostituzione</th>
                                <td>{selectedContatore.sostituzione ? 'Sì' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Subentro</th>
                                <td>{selectedContatore.subentro ? 'Sì' : 'No'}</td>
                            </tr>
                            <tr>
                                <th>Data Installazione</th>
                                <td>{selectedContatore.dataInstallazione ? new Date(selectedContatore.dataInstallazione).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Data Scadenza</th>
                                <td>{selectedContatore.dataScadenza ? new Date(selectedContatore.dataScadenza).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Note</th>
                                <td>{selectedContatore.note}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClienteDetails;