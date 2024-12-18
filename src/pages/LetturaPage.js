import React, { useState } from 'react';
import LetturaForm from '../components/Lettura/LetturaForm';
import LetturaList from '../components/Lettura/LetturaList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Lettura/LetturaPage.css';

const LetturaPage = () => {
    const [selectedLetturaId, setSelectedLetturaId] = useState(null);

    const handleLetturaSelect = (letturaId) => 
    {
        setSelectedLetturaId(letturaId);
    };

    const handleLetturaDeselect = () => 
    {
        setSelectedLetturaId(null);
    };

    return (
        <div className="lettura-page">
            <Tabs>
                <TabList>
                    <Tab>Lista Letture</Tab>
                    <Tab>Registra Lettura</Tab>  
                </TabList>
                <TabPanel>
                    <LetturaList onSelectLettura={handleLetturaSelect} selectedLetturaId={selectedLetturaId} onDeselectLettura={handleLetturaDeselect} />
                </TabPanel>
                <TabPanel>
                    <LetturaForm onSuccess={handleLetturaDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default LetturaPage;