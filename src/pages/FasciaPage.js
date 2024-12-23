import React, { useState } from 'react';
import FasciaForm from '../components/Fascia/FasciaForm';
import FasciaList from '../components/Fascia/FasciaList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Fascia/FasciaPage.css';

const FasciaPage = () => 
{
    const [selectedFasciaId, setSelectedFasciaId] = useState(null);

    const handleFasciaSelect = (fasciaId) => 
    {
        setSelectedFasciaId(fasciaId);
    };

    const handleFasciaDeselect = () => 
    {
        setSelectedFasciaId(null);
    };

    return (
        <div className="fascia-page">
            <Tabs>
                <TabList>
                    <Tab>Lista Fasce</Tab>
                    <Tab>Registra Fascia</Tab>
                </TabList>
                <TabPanel>
                    <FasciaList onSelectFascia={handleFasciaSelect} selectedFasciaId={selectedFasciaId} onDeselectFascia={handleFasciaDeselect} />
                </TabPanel>
                <TabPanel>
                    <FasciaForm onSuccess={handleFasciaDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default FasciaPage;