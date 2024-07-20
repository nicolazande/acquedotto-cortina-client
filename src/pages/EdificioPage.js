import React, { useState } from 'react';
import EdificioForm from '../components/Edificio/EdificioForm';
import EdificioList from '../components/Edificio/EdificioList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Edificio/EdificioPage.css';

const EdificioPage = () => 
{
    const [selectedEdificioId, setSelectedEdificioId] = useState(null);

    const handleEdificioSelect = (edificioId) => 
    {
        setSelectedEdificioId(edificioId);
    };

    const handleEdificioDeselect = () => 
    {
        setSelectedEdificioId(null);
    };

    return (
        <div className="edificio-page">
            <Tabs>
                <TabList>
                    <Tab>Lista Edifici</Tab>
                    <Tab>Registra Edificio</Tab>
                </TabList>
                <TabPanel>
                    <EdificioList onSelectEdificio={handleEdificioSelect} selectedEdificioId={selectedEdificioId} onDeselectEdificio={handleEdificioDeselect} />
                </TabPanel>
                <TabPanel>
                    <EdificioForm onSuccess={handleEdificioDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default EdificioPage;
