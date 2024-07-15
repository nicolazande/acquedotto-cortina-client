import React, { useEffect, useState } from 'react';
import edificioApi from '../../api/edificioApi';
import '../../styles/Edificio/EdificioDetails.css';

const EdificioDetails = ({ edificioId }) => {
    const [edificio, setEdificio] = useState(null);
    const [contatori, setContatori] = useState([]);
    const [showContatori, setShowContatori] = useState(false);

    useEffect(() => {
        const fetchEdificio = async () => {
            try {
                const response = await edificioApi.getEdificio(edificioId);
                setEdificio(response.data);
            } catch (error) {
                alert('Errore durante il recupero dell\'edificio');
                console.error(error);
            }
        };

        if (edificioId) {
            fetchEdificio();
        }
    }, [edificioId]);

    const fetchContatori = async () => {
        try {
            const response = await edificioApi.getContatori(edificioId);
            setContatori(response.data);
            setShowContatori(true);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    if (!edificio) {
        return <div>Seleziona un edificio per vedere i dettagli</div>;
    }

    return (
        <div className="edificio-detail">
            <h2>Dettagli Edificio</h2>
            <table className="edificio-table">
                <tbody>
                    <tr>
                        <th>Descrizione</th>
                        <td>{edificio.descrizione}</td>
                    </tr>
                    <tr>
                        <th>Indirizzo</th>
                        <td>{edificio.indirizzo}</td>
                    </tr>
                    <tr>
                        <th>Numero</th>
                        <td>{edificio.numero}</td>
                    </tr>
                    <tr>
                        <th>CAP</th>
                        <td>{edificio.CAP}</td>
                    </tr>
                    <tr>
                        <th>Località</th>
                        <td>{edificio.localita}</td>
                    </tr>
                    <tr>
                        <th>Provincia</th>
                        <td>{edificio.provincia}</td>
                    </tr>
                    <tr>
                        <th>Nazione</th>
                        <td>{edificio.nazione}</td>
                    </tr>
                    <tr>
                        <th>Attività</th>
                        <td>{edificio.attivita}</td>
                    </tr>
                    <tr>
                        <th>Posti Letto</th>
                        <td>{edificio.postiLetto}</td>
                    </tr>
                    <tr>
                        <th>Latitudine</th>
                        <td>{edificio.latitudine}</td>
                    </tr>
                    <tr>
                        <th>Longitudine</th>
                        <td>{edificio.longitudine}</td>
                    </tr>
                    <tr>
                        <th>Unità Abitative</th>
                        <td>{edificio.unitaAbitative}</td>
                    </tr>
                    <tr>
                        <th>Catasto</th>
                        <td>{edificio.catasto}</td>
                    </tr>
                    <tr>
                        <th>Foglio</th>
                        <td>{edificio.foglio}</td>
                    </tr>
                    <tr>
                        <th>PED</th>
                        <td>{edificio.PED}</td>
                    </tr>
                    <tr>
                        <th>Estensione</th>
                        <td>{edificio.estensione}</td>
                    </tr>
                    <tr>
                        <th>Tipo</th>
                        <td>{edificio.tipo}</td>
                    </tr>
                    <tr>
                        <th>Note</th>
                        <td>{edificio.note}</td>
                    </tr>
                </tbody>
            </table>
            <button onClick={fetchContatori} className="btn-show-contatori">Visualizza Contatori</button>
            {showContatori && (
                <div className="contatori-section">
                    <h3>Contatori Associati</h3>
                    <table className="contatori-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
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
                                    <td>{contatore.cliente ? `${contatore.cliente.nome} ${contatore.cliente.cognome}` : 'N/A'}</td>
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
        </div>
    );
};

export default EdificioDetails;
