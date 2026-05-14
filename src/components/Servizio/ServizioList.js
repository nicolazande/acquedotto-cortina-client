import React from 'react';
import { listViews } from '../../config/listViews';
import ListPage from '../shared/ListPage';

const ServizioList = ({ onSelectServizio }) => (
    <ListPage config={listViews.servizi} onSelect={onSelectServizio} />
);

export default ServizioList;
