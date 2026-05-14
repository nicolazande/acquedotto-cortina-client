import React from 'react';
import { listViews } from '../../config/listViews';
import ListPage from '../shared/ListPage';

const ContatoreList = ({ onSelectContatore }) => (
    <ListPage config={listViews.contatori} onSelect={onSelectContatore} />
);

export default ContatoreList;
