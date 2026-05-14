import React from 'react';
import { listViews } from '../../config/listViews';
import ListPage from '../shared/ListPage';

const ScadenzaList = ({ onSelectScadenza }) => (
    <ListPage config={listViews.scadenze} onSelect={onSelectScadenza} />
);

export default ScadenzaList;
