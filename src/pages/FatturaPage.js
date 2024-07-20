import React, { useState } from 'react';
import FatturaForm from '../components/Fattura/FatturaForm';
import FatturaList from '../components/Fattura/FatturaList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Fattura/FatturaPage.css';

const FatturaPage = () => 
{
    const [selectedFatturaId, setSelectedFatturaId] = useState(null);

    const handleFatturaSelect = (fatturaId) => 
    {
        setSelectedFatturaId(fatturaId);
    };

    const handleFatturaDeselect = () => 
    {
        setSelectedFatturaId(null);
    };

    return (
        <div className="fattura-page">
            <Tabs>
                <TabList>
                    <Tab>Lista Fatture</Tab>
                    <Tab>Registra Fattura</Tab>
                </TabList>
                <TabPanel>
                    <FatturaList onSelectFattura={handleFatturaSelect} selectedFatturaId={selectedFatturaId} onDeselectFattura={handleFatturaDeselect} />
                </TabPanel>
                <TabPanel>
                    <FatturaForm onSuccess={handleFatturaDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default FatturaPage;