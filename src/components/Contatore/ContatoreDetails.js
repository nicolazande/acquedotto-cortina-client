import React, { useEffect, useState } from 'react';
import contatoreApi from '../../api/contatoreApi';
import '../../styles/Contatore/ContatoreDetails.css';

const ContatoreDetails = ({ contatoreId }) => {
    const [contatore, setContatore] = useState(null);

    useEffect(() => {
        const fetchContatore = async () => {
            try {
                const response = await contatoreApi.getContatore(contatoreId);
                setContatore(response.data);
            } catch (error) {
                alert('Errore durante il recupero del contatore');
                console.error(error);
            }
        };

        if (contatoreId) {
            fetchContatore();
        }
    }, [contatoreId]);

    if (!contatore) {
        return <div>Caricamento...</div>;
    }

    return (
        <div className="contatore-detail">
            <h2>Dettagli Contatore</h2>
            <p><strong>Seriale:</strong> {contatore.seriale}</p>
            <p><strong>Seriale Interno:</strong> {contatore.serialeInterno}</p>
            <p><strong>Ultima Lettura:</strong> {new Date(contatore.ultimaLettura).toLocaleDateString()}</p>
            <p><strong>Attivo:</strong> {contatore.attivo ? 'Sì' : 'No'}</p>
            <p><strong>Condominiale:</strong> {contatore.condominiale ? 'Sì' : 'No'}</p>
            <p><strong>Sostituzione:</strong> {contatore.sostituzione ? 'Sì' : 'No'}</p>
            <p><strong>Subentro:</strong> {contatore.subentro ? 'Sì' : 'No'}</p>
            <p><strong>Data Installazione:</strong> {new Date(contatore.dataInstallazione).toLocaleDateString()}</p>
            <p><strong>Data Scadenza:</strong> {new Date(contatore.dataScadenza).toLocaleDateString()}</p>
            <p><strong>Note:</strong> {contatore.note}</p>
            <p><strong>Edificio:</strong> {contatore.edificio ? contatore.edificio.descrizione : 'N/A'}</p>
            <p><strong>Listino:</strong> {contatore.listino ? contatore.listino.nome : 'N/A'}</p>
            <p><strong>Cliente:</strong> {contatore.cliente ? `${contatore.cliente.nome} ${contatore.cliente.cognome}` : 'N/A'}</p>
        </div>
    );
};

export default ContatoreDetails;