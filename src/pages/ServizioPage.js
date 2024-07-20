import React, { useState } from 'react';
import ServizioForm from '../components/Servizio/ServizioForm';
import ServizioList from '../components/Servizio/ServizioList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Servizio/ServizioPage.css';

const ServizioPage = () => 
{
    const [selectedServizioId, setSelectedServizioId] = useState(null);

    const handleServizioSelect = (servizioId) => 
    {
        setSelectedServizioId(servizioId);
    };

    const handleServizioDeselect = () => 
    {
        setSelectedServizioId(null);
    };

    return (
        <div className="servizio-page">
            <Tabs>
                <TabList>
                    <Tab>Lista Servizi</Tab>
                    <Tab>Registra Servizio</Tab> 
                </TabList>
                <TabPanel>
                    <ServizioList onSelectServizio={handleServizioSelect} selectedServizioId={selectedServizioId} onDeselectServizio={handleServizioDeselect} />
                </TabPanel>
                <TabPanel>
                    <ServizioForm onSuccess={handleServizioDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default ServizioPage;