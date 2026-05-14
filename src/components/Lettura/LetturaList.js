import React from 'react';
import { listViews } from '../../config/listViews';
import ListPage from '../shared/ListPage';

const LetturaList = ({ onSelectLettura }) => (
    <ListPage config={listViews.letture} onSelect={onSelectLettura} />
);

export default LetturaList;
