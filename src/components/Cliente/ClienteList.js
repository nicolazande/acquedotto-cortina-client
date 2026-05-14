import React from 'react';
import { listViews } from '../../config/listViews';
import ListPage from '../shared/ListPage';

const ClienteList = ({ onSelectCliente }) => (
    <ListPage config={listViews.clienti} onSelect={onSelectCliente} />
);

export default ClienteList;
