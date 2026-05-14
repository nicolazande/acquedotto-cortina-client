import React from 'react';
import { listViews } from '../../config/listViews';
import ListPage from '../shared/ListPage';

const FatturaList = ({ onSelectFattura }) => (
    <ListPage config={listViews.fatture} onSelect={onSelectFattura} />
);

export default FatturaList;
