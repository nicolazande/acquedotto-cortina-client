import React, { useState } from 'react';
import ClienteList from '../components/Cliente/ClienteList';
import '../styles/Cliente/ClientePage.css';

const ClientePage = () => {
    const [, setSelectedClienteId] = useState(null);

    const handleClienteSelect = (clienteId) => {
        setSelectedClienteId(clienteId);
    };

    return (
        <div className="cliente-page">
            <ClienteList
                onSelectCliente={handleClienteSelect}
            />
        </div>
    );
};

export default ClientePage;
