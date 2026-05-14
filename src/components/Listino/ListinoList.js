import React from 'react';
import { listViews } from '../../config/listViews';
import ListPage from '../shared/ListPage';

const ListinoList = ({ onSelectListino }) => (
    <ListPage config={listViews.listini} onSelect={onSelectListino} />
);

export default ListinoList;
