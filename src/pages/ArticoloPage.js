import React, { useState } from 'react';
import ArticoloForm from '../components/Articolo/ArticoloForm';
import ArticoloList from '../components/Articolo/ArticoloList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Articolo/ArticoloPage.css';

const ArticoloPage = () => {
    const [selectedArticoloId, setSelectedArticoloId] = useState(null);

    const handleArticoloSelect = (articoloId) => {
        setSelectedArticoloId(articoloId);
    };

    const handleArticoloDeselect = () => {
        setSelectedArticoloId(null);
    };

    return (
        <div className="articolo-page">
            <Tabs>
                <TabList>
                    <Tab>Registra Articolo</Tab>
                    <Tab>Lista Articoli</Tab>
                </TabList>

                <TabPanel>
                    <ArticoloForm onSuccess={handleArticoloDeselect} />
                </TabPanel>
                <TabPanel>
                    <ArticoloList onSelectArticolo={handleArticoloSelect} selectedArticoloId={selectedArticoloId} onDeselectArticolo={handleArticoloDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default ArticoloPage;