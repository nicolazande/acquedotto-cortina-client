import React from 'react';
import EdificioList from '../Edificio/EdificioList';
import ListPage from './ListPage';
import { listViews } from '../../config/listViews';

const createListComponent = (resourceKey, selectProp) => {
    const ListComponent = (props) => (
        <ListPage config={listViews[resourceKey]} onSelect={props[selectProp]} />
    );

    ListComponent.displayName = `${resourceKey}List`;
    return ListComponent;
};

export const listComponents = {
    articoli: createListComponent('articoli', 'onSelectArticolo'),
    clienti: createListComponent('clienti', 'onSelectCliente'),
    contatori: createListComponent('contatori', 'onSelectContatore'),
    edifici: EdificioList,
    fasce: createListComponent('fasce', 'onSelectFascia'),
    fatture: createListComponent('fatture', 'onSelectFattura'),
    letture: createListComponent('letture', 'onSelectLettura'),
    listini: createListComponent('listini', 'onSelectListino'),
    scadenze: createListComponent('scadenze', 'onSelectScadenza'),
    servizi: createListComponent('servizi', 'onSelectServizio'),
};
