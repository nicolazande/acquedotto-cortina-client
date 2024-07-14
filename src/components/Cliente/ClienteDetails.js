import React, { useEffect, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import '../../styles/Cliente.css';

const ClienteDetails = ({ clienteId }) => {
    const [cliente, setCliente] = useState(null);

    useEffect(() => {
        const fetchCliente = async () => {
            try {
                const response = await clienteApi.getCliente(clienteId);
                setCliente(response.data);
            } catch (error) {
                alert('Errore durante il recupero del cliente');
                console.error(error);
            }
        };

        if (clienteId) {
            fetchCliente();
        }
    }, [clienteId]);

    if (!cliente) {
        return <div>Seleziona un cliente per vedere i dettagli</div>;
    }

    return (
        <div className="cliente-details">
            <h2>Dettagli Cliente</h2>
            <p><strong>Ragione Sociale:</strong> {cliente.ragioneSociale}</p>
            <p><strong>Nome:</strong> {cliente.nome}</p>
            <p><strong>Cognome:</strong> {cliente.cognome}</p>
            <p><strong>Sesso:</strong> {cliente.sesso}</p>
            <p><strong>Socio:</strong> {cliente.socio ? 'Sì' : 'No'}</p>
            <p><strong>Data di Nascita:</strong> {new Date(cliente.dataNascita).toLocaleDateString()}</p>
            <p><strong>Comune di Nascita:</strong> {cliente.comuneNascita}</p>
            <p><strong>Provincia di Nascita:</strong> {cliente.provinciaNascita}</p>
            <p><strong>Indirizzo di Residenza:</strong> {cliente.indirizzoResidenza}</p>
            <p><strong>Numero Residenza:</strong> {cliente.numeroResidenza}</p>
            <p><strong>CAP Residenza:</strong> {cliente.capResidenza}</p>
            <p><strong>Località Residenza:</strong> {cliente.localitaResidenza}</p>
            <p><strong>Provincia Residenza:</strong> {cliente.provinciaResidenza}</p>
            <p><strong>Nazione Residenza:</strong> {cliente.nazioneResidenza}</p>
            <p><strong>Destinazione Fatturazione:</strong> {cliente.destinazioneFatturazione}</p>
            <p><strong>Indirizzo Fatturazione:</strong> {cliente.indirizzoFatturazione}</p>
            <p><strong>Numero Fatturazione:</strong> {cliente.numeroFatturazione}</p>
            <p><strong>CAP Fatturazione:</strong> {cliente.capFatturazione}</p>
            <p><strong>Località Fatturazione:</strong> {cliente.localitaFatturazione}</p>
            <p><strong>Provincia Fatturazione:</strong> {cliente.provinciaFatturazione}</p>
            <p><strong>Nazione Fatturazione:</strong> {cliente.nazioneFatturazione}</p>
            <p><strong>Codice Fiscale:</strong> {cliente.codiceFiscale}</p>
            <p><strong>Telefono:</strong> {cliente.telefono}</p>
            <p><strong>Email:</strong> {cliente.email}</p>
            <p><strong>Pagamento:</strong> {cliente.pagamento}</p>
            <p><strong>Codice Destinatario:</strong> {cliente.codiceDestinatario}</p>
            <p><strong>Fattura Elettronica:</strong> {cliente.fatturaElettronica}</p>
            <p><strong>Codice ERP:</strong> {cliente.codiceERP}</p>
            <p><strong>IBAN:</strong> {cliente.IBAN}</p>
            <p><strong>Note:</strong> {cliente.note}</p>
            <p><strong>Quote:</strong> {cliente.quote}</p>
        </div>
    );
};

export default ClienteDetails;
