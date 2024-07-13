import React, { useState } from 'react';
import ClienteForm from '../components/Cliente/ClienteForm';
import ClienteList from '../components/Cliente/ClienteList';
import ClienteDetail from '../components/Cliente/ClienteDetails';
import '../styles/Cliente.css';

const ClientePage = () => {
    const [selectedClienteId, setSelectedClienteId] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const handleClienteSelect = (clienteId) => {
        setSelectedClienteId(clienteId);
    };

    const handleRefresh = () => {
        setRefresh((prev) => !prev); // Cambia il valore di refresh per forzare l'aggiornamento della lista
    };

    return (
        <div className="cliente-page">
            <div className="cliente-form">
                <h1>Registra Cliente</h1>
                <ClienteForm onSuccess={handleRefresh} />
            </div>
            <div className="cliente-list">
                <ClienteList onSelectCliente={handleClienteSelect} refresh={refresh} />
            </div>
            <div className="cliente-detail">
                <ClienteDetail clienteId={selectedClienteId} />
            </div>
        </div>
    );
};

export default ClientePage;