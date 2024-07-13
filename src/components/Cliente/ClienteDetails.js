import React, { useEffect, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import '../../styles/Cliente.css';

const ClienteDetail = ({ clienteId }) => {
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
        <div>
            <h2>Dettagli Cliente</h2>
            <p><strong>Nome:</strong> {cliente.nome}</p>
            <p><strong>Cognome:</strong> {cliente.cognome}</p>
            <p><strong>Email:</strong> {cliente.email}</p>
            <p><strong>Telefono:</strong> {cliente.telefono}</p>
        </div>
    );
};

export default ClienteDetail;