import React, { useEffect, useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Fattura/FatturaDetails.css';

const FatturaDetails = ({ fatturaId }) => {
    const [fattura, setFattura] = useState(null);
    const [cliente, setCliente] = useState(null);

    useEffect(() => {
        const fetchFattura = async () => {
            try {
                const response = await fatturaApi.getFattura(fatturaId);
                setFattura(response.data);

                if (response.data.cliente) {
                    fetchCliente(response.data.cliente);
                }
            } catch (error) {
                alert('Errore durante il recupero della fattura');
                console.error(error);
            }
        };

        const fetchCliente = async (clienteId) => {
            try {
                const response = await fatturaApi.getCliente(clienteId);
                setCliente(response.data);
            } catch (error) {
                alert('Errore durante il recupero del cliente');
                console.error(error);
            }
        };

        if (fatturaId) {
            fetchFattura();
        }
    }, [fatturaId]);

    if (!fattura) {
        return <div>Caricamento...</div>;
    }

    return (
        <div className="fattura-detail">
            <h2>Dettagli Fattura</h2>
            <table className="info-table">
                <tbody>
                    <tr>
                        <th>Tipo</th>
                        <td>{fattura.tipo}</td>
                    </tr>
                    <tr>
                        <th>Ragione Sociale</th>
                        <td>{fattura.ragioneSociale}</td>
                    </tr>
                    <tr>
                        <th>Anno</th>
                        <td>{fattura.anno}</td>
                    </tr>
                    <tr>
                        <th>Numero</th>
                        <td>{fattura.numero}</td>
                    </tr>
                    <tr>
                        <th>Data</th>
                        <td>{new Date(fattura.data).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <th>Confermata</th>
                        <td>{fattura.confermata ? 'Sì' : 'No'}</td>
                    </tr>
                    <tr>
                        <th>Codice</th>
                        <td>{fattura.codice}</td>
                    </tr>
                </tbody>
            </table>
            <div className="associated-info">
                {cliente && (
                    <div className="cliente-info">
                        <h3>Cliente Associato</h3>
                        <p><strong>Nome:</strong> {cliente.nome} {cliente.cognome}</p>
                        <p><strong>Ragione Sociale:</strong> {cliente.ragioneSociale}</p>
                        <button className="btn">Dettagli Cliente</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FatturaDetails;