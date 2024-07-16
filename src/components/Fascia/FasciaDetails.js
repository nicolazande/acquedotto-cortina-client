import React, { useEffect, useState } from 'react';
import fasciaApi from '../../api/fasciaApi';
import listinoApi from '../../api/listinoApi';
import '../../styles/Fascia/FasciaDetails.css';

const FasciaDetails = ({ fasciaId }) => {
    const [fascia, setFascia] = useState(null);
    const [listino, setListino] = useState(null);

    useEffect(() => {
        const fetchFascia = async () => {
            try {
                const response = await fasciaApi.getFascia(fasciaId);
                setFascia(response.data);

                if (response.data.listino) {
                    fetchListino(response.data.listino);
                }
            } catch (error) {
                alert('Errore durante il recupero della fascia');
                console.error(error);
            }
        };

        const fetchListino = async (listinoId) => {
            try {
                const response = await listinoApi.getListino(listinoId);
                setListino(response.data);
            } catch (error) {
                alert('Errore durante il recupero del listino');
                console.error(error);
            }
        };

        if (fasciaId) {
            fetchFascia();
        }
    }, [fasciaId]);

    if (!fascia) {
        return <div>Seleziona una fascia per vedere i dettagli</div>;
    }

    return (
        <div className="fascia-detail">
            <h2>Dettagli Fascia</h2>
            <table className="info-table">
                <tbody>
                    <tr>
                        <th>Tipo</th>
                        <td>{fascia.tipo}</td>
                    </tr>
                    <tr>
                        <th>Min</th>
                        <td>{fascia.min}</td>
                    </tr>
                    <tr>
                        <th>Max</th>
                        <td>{fascia.max}</td>
                    </tr>
                    <tr>
                        <th>Prezzo</th>
                        <td>{fascia.prezzo}</td>
                    </tr>
                    <tr>
                        <th>Scadenza</th>
                        <td>{fascia.scadenza ? new Date(fascia.scadenza).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Fisso</th>
                        <td>{fascia.fisso}</td>
                    </tr>
                    <tr>
                        <th>Listino</th>
                        <td>{listino ? `${listino.categoria} - ${listino.descrizione}` : 'N/A'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default FasciaDetails;