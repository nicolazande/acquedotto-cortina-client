import React, { useState } from 'react';
import ClienteForm from '../components/Cliente/ClienteForm';
import ClienteList from '../components/Cliente/ClienteList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Cliente/ClientePage.css';

const ClientePage = () => 
{
    const [selectedClienteId, setSelectedClienteId] = useState(null);

    const handleClienteSelect = (clienteId) => 
    {
        setSelectedClienteId(clienteId);
    };

    const handleClienteDeselect = () => 
    {
        setSelectedClienteId(null);
    };

    return (
        <div className="cliente-page">
            <Tabs>
                <TabList>
                    <Tab>Lista Clienti</Tab>
                    <Tab>Registra Cliente</Tab>
                </TabList>
                <TabPanel>
                    <ClienteList onSelectCliente={handleClienteSelect} selectedClienteId={selectedClienteId} onDeselectCliente={handleClienteDeselect} />
                </TabPanel>
                <TabPanel>
                    <ClienteForm onSuccess={handleClienteDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default ClientePage;