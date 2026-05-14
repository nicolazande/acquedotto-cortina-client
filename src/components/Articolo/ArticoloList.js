import React from 'react';
import { listViews } from '../../config/listViews';
import ListPage from '../shared/ListPage';

const ArticoloList = ({ onSelectArticolo }) => (
    <ListPage config={listViews.articoli} onSelect={onSelectArticolo} />
);

export default ArticoloList;
