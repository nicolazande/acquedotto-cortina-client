import React, { useEffect, useState } from 'react';
import listinoApi from '../../api/listinoApi';
import '../../styles/Listino/ListinoDetails.css';

const ListinoDetails = ({ listinoId }) => {
    const [listino, setListino] = useState(null);

    useEffect(() => {
        const fetchListino = async () => {
            try {
                const response = await listinoApi.getListino(listinoId);
                setListino(response.data);
            } catch (error) {
                alert('Errore durante il recupero del listino');
                console.error(error);
            }
        };

        if (listinoId) {
            fetchListino();
        }
    }, [listinoId]);

    if (!listino) {
        return <div>Seleziona un listino per vedere i dettagli</div>;
    }

    return (
        <div className="listino-detail">
            <h2>Dettagli Listino</h2>
            <table className="info-table">
                <tbody>
                    <tr>
                        <th>Categoria</th>
                        <td>{listino.categoria}</td>
                    </tr>
                    <tr>
                        <th>Descrizione</th>
                        <td>{listino.descrizione}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ListinoDetails;