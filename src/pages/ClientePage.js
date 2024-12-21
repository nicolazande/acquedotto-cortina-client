import React, { useState } from 'react';
import ClienteList from '../components/Cliente/ClienteList';
import '../styles/Cliente/ClientePage.css';

const ClientePage = () => {
    const [selectedClienteId, setSelectedClienteId] = useState(null);

    const handleClienteSelect = (clienteId) => {
        setSelectedClienteId(clienteId);
    };

    const handleClienteDeselect = () => {
        setSelectedClienteId(null);
    };

    return (
        <div className="cliente-page">
            <ClienteList
                onSelectCliente={handleClienteSelect}
                selectedClienteId={selectedClienteId}
                onDeselectCliente={handleClienteDeselect}
            />
        </div>
    );
};

export default ClientePage;
