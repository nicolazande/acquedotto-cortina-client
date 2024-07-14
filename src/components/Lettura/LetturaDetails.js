import React, { useEffect, useState } from 'react';
import letturaApi from '../../api/letturaApi';
import '../../styles/Lettura/LetturaDetails.css';

const LetturaDetails = ({ letturaId }) => {
    const [lettura, setLettura] = useState(null);

    useEffect(() => {
        const fetchLettura = async () => {
            try {
                const response = await letturaApi.getLettura(letturaId);
                setLettura(response.data);
            } catch (error) {
                alert('Errore durante il recupero della lettura');
                console.error(error);
            }
        };

        if (letturaId) {
            fetchLettura();
        }
    }, [letturaId]);

    if (!lettura) {
        return <div>Caricamento...</div>;
    }

    const { contatore } = lettura;

    return (
        <div className="lettura-detail">
            <h2>Dettagli Lettura</h2>
            <div className="form-group">
                <label>Cliente:</label>
                <span>{lettura.cliente}</span>
            </div>
            <div className="form-group">
                <label>Tipo:</label>
                <span>{lettura.tipo}</span>
            </div>
            <div className="form-group">
                <label>Data:</label>
                <span>{new Date(lettura.data).toLocaleDateString()}</span>
            </div>
            <div className="form-group">
                <label>Valore:</label>
                <span>{lettura.valore}</span>
            </div>
            <div className="form-group">
                <label>UdM:</label>
                <span>{lettura.UdM}</span>
            </div>
            <div className="form-group">
                <label>Fatturata:</label>
                <span>{lettura.fatturata ? 'Si' : 'No'}</span>
            </div>
            <div className="form-group">
                <label>Note:</label>
                <span>{lettura.note}</span>
            </div>
            <div className="form-group">
                <label>Contatore:</label>
                <span>{contatore ? contatore.seriale : 'N/A'}</span>
            </div>
        </div>
    );
};

export default LetturaDetails;