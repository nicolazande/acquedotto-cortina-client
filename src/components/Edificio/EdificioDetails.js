import React, { useEffect, useState } from 'react';
import edificioApi from '../../api/edificioApi';
import '../../styles/Edificio.css';

const EdificioDetails = ({ edificioId }) => {
    const [edificio, setEdificio] = useState(null);

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

    if (!edificio) {
        return <div>Seleziona un edificio per vedere i dettagli</div>;
    }

    return (
        <div>
            <h2>Dettagli Edificio</h2>
            <p><strong>Descrizione:</strong> {edificio.descrizione}</p>
            <p><strong>Indirizzo:</strong> {edificio.indirizzo}</p>
            <p><strong>Numero:</strong> {edificio.numero}</p>
            <p><strong>CAP:</strong> {edificio.CAP}</p>
            <p><strong>Località:</strong> {edificio.localita}</p>
            <p><strong>Provincia:</strong> {edificio.provincia}</p>
            <p><strong>Nazione:</strong> {edificio.nazione}</p>
            <p><strong>Attività:</strong> {edificio.attivita}</p>
            <p><strong>Posti Letto:</strong> {edificio.postiLetto}</p>
            <p><strong>Latitudine:</strong> {edificio.latitudine}</p>
            <p><strong>Longitudine:</strong> {edificio.longitudine}</p>
            <p><strong>Unità Abitative:</strong> {edificio.unitaAbitative}</p>
            <p><strong>Catasto:</strong> {edificio.catasto}</p>
            <p><strong>Foglio:</strong> {edificio.foglio}</p>
            <p><strong>PED:</strong> {edificio.PED}</p>
            <p><strong>Estensione:</strong> {edificio.estensione}</p>
            <p><strong>Tipo:</strong> {edificio.tipo}</p>
            <p><strong>Note:</strong> {edificio.note}</p>
        </div>
    );
};

export default EdificioDetails;