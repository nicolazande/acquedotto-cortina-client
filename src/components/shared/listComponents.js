import React, { lazy, Suspense } from 'react';
import ListPage from './ListPage';
import PageLoading from './PageLoading';
import { listViews } from '../../config/listViews';

// La lista edifici porta con se Leaflet e il suo CSS, che pesano piu di tutto il
// resto dell'applicazione. Caricarla su richiesta evita di farli scaricare a chi
// non apre mai la mappa. Il confine Suspense e qui dentro, cosi chi usa il
// componente non deve saperne nulla.
const EdificioListLazy = lazy(() => import('../Edificio/EdificioList'));

const EdificioList = (props) => (
    <Suspense fallback={<PageLoading label="Caricamento mappa edifici..." />}>
        <EdificioListLazy {...props} />
    </Suspense>
);

EdificioList.displayName = 'edificiList';

const createListComponent = (resourceKey, selectProp) => {
    const ListComponent = (props) => (
        <ListPage
            config={listViews[resourceKey]}
            detailReturnLabel={props.detailReturnLabel}
            onSelect={props[selectProp]}
        />
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
