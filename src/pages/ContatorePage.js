import React, { useState } from 'react';
import ContatoreForm from '../components/Contatore/ContatoreForm';
import ContatoreList from '../components/Contatore/ContatoreList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Contatore/ContatorePage.css';

const ContatorePage = () => 
{
    const [selectedContatoreId, setSelectedContatoreId] = useState(null);

    const handleContatoreSelect = (contatoreId) => 
    {
        setSelectedContatoreId(contatoreId);
    };

    const handleContatoreDeselect = () => 
    {
        setSelectedContatoreId(null);
    };

    return (
        <div className="contatore-page">
            <Tabs>
                <TabList>
                    <Tab>Lista Contatori</Tab>
                    <Tab>Registra Contatore</Tab>
                </TabList>
                <TabPanel>
                    <ContatoreList onSelectContatore={handleContatoreSelect} selectedContatoreId={selectedContatoreId} onDeselectContatore={handleContatoreDeselect} />
                </TabPanel>
                <TabPanel>
                    <ContatoreForm onSuccess={handleContatoreDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default ContatorePage;