import React, { useEffect, useState } from 'react';
import servizioApi from '../../api/servizioApi';
import '../../styles/Servizio/ServizioDetails.css';

const ServizioDetails = ({ servizioId }) => {
    const [servizio, setServizio] = useState(null);

    useEffect(() => {
        const fetchServizio = async () => {
            try {
                const response = await servizioApi.getServizio(servizioId);
                setServizio(response.data);
            } catch (error) {
                alert('Errore durante il recupero del servizio');
                console.error(error);
            }
        };

        if (servizioId) {
            fetchServizio();
        }
    }, [servizioId]);

    if (!servizio) {
        return <div>Seleziona un servizio per vedere i dettagli</div>;
    }

    return (
        <div className="servizio-detail">
            <h2>Dettagli Servizio</h2>
            <table className="info-table">
                <tbody>
                    <tr>
                        <th>Descrizione</th>
                        <td>{servizio.descrizione}</td>
                    </tr>
                    <tr>
                        <th>Valore</th>
                        <td>{servizio.valore}</td>
                    </tr>
                    <tr>
                        <th>Tariffa</th>
                        <td>{servizio.tariffa}</td>
                    </tr>
                    <tr>
                        <th>m3</th>
                        <td>{servizio.m3}</td>
                    </tr>
                    <tr>
                        <th>Prezzo</th>
                        <td>{servizio.prezzo}</td>
                    </tr>
                    <tr>
                        <th>Seriale</th>
                        <td>{servizio.seriale}</td>
                    </tr>
                    <tr>
                        <th>Lettura</th>
                        <td>{servizio.lettura ? `${servizio.lettura.cliente} - ${new Date(servizio.lettura.data).toLocaleDateString()}` : 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Articolo</th>
                        <td>{servizio.articolo ? servizio.articolo.descrizione : 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Fattura</th>
                        <td>{servizio.fattura ? servizio.fattura.codice : 'N/A'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ServizioDetails;