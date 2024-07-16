import React, { useState } from 'react';
import ListinoForm from '../components/Listino/ListinoForm';
import ListinoList from '../components/Listino/ListinoList';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/Listino/ListinoPage.css';

const ListinoPage = () => {
    const [selectedListinoId, setSelectedListinoId] = useState(null);

    const handleListinoSelect = (listinoId) => {
        setSelectedListinoId(listinoId);
    };

    const handleListinoDeselect = () => {
        setSelectedListinoId(null);
    };

    return (
        <div className="listino-page">
            <Tabs>
                <TabList>
                    <Tab>Registra Listino</Tab>
                    <Tab>Lista Listini</Tab>
                </TabList>

                <TabPanel>
                    <ListinoForm onSuccess={handleListinoDeselect} />
                </TabPanel>
                <TabPanel>
                    <ListinoList onSelectListino={handleListinoSelect} selectedListinoId={selectedListinoId} onDeselectListino={handleListinoDeselect} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default ListinoPage;