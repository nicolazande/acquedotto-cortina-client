import React, { useState } from 'react';
import ScadenzaForm from '../components/Scadenza/ScadenzaForm';
import ScadenzaList from '../components/Scadenza/ScadenzaList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Scadenza/ScadenzaPage.css';

const ScadenzaPage = () => {
    const [selectedScadenzaId, setSelectedScadenzaId] = useState(null);

    const handleScadenzaSelect = (scadenzaId) => {
        setSelectedScadenzaId(scadenzaId);
    };

    const handleScadenzaDeselect = () => {
        setSelectedScadenzaId(null);
    };

    return (
        <div className="scadenza-page">
            <Tabs>
                <TabList>
                    <Tab>Lista Scadenze</Tab>
                    <Tab>Registra Scadenza</Tab>
                </TabList>
                <TabPanel>
                    <ScadenzaList onSelectScadenza={handleScadenzaSelect} selectedScadenzaId={selectedScadenzaId} onDeselectScadenza={handleScadenzaDeselect} />
                </TabPanel>
                <TabPanel>
                    <ScadenzaForm onSuccess={handleScadenzaDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default ScadenzaPage;
