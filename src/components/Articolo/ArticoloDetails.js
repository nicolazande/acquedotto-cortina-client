import React, { useEffect, useState } from 'react';
import articoloApi from '../../api/articoloApi';
import '../../styles/Articolo/ArticoloDetails.css';

const ArticoloDetails = ({ articoloId }) => {
    const [articolo, setArticolo] = useState(null);

    useEffect(() => {
        const fetchArticolo = async () => {
            try {
                const response = await articoloApi.getArticolo(articoloId);
                setArticolo(response.data);
            } catch (error) {
                alert('Errore durante il recupero dell\'articolo');
                console.error(error);
            }
        };

        if (articoloId) {
            fetchArticolo();
        }
    }, [articoloId]);

    if (!articolo) {
        return <div>Seleziona un articolo per vedere i dettagli</div>;
    }

    return (
        <div className="articolo-detail">
            <h2>Dettagli Articolo</h2>
            <table className="info-table">
                <tbody>
                    <tr>
                        <th>Codice</th>
                        <td>{articolo.codice}</td>
                    </tr>
                    <tr>
                        <th>Descrizione</th>
                        <td>{articolo.descrizione}</td>
                    </tr>
                    <tr>
                        <th>IVA</th>
                        <td>{articolo.iva}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ArticoloDetails;