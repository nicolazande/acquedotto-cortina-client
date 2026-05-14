import React from 'react';
import { listViews } from '../../config/listViews';
import ListPage from '../shared/ListPage';

const FasciaList = ({ onSelectFascia }) => (
    <ListPage config={listViews.fasce} onSelect={onSelectFascia} />
);

export default FasciaList;
