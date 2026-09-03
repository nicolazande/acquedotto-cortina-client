import React, { lazy, Suspense } from 'react';
import ListPage from './ListPage';
import PageLoading from './PageLoading';
import { listViews } from '../../config/listViews';
import { selectProp } from '../../config/resourceMeta';

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

const createListComponent = (nome) => {
    const ListComponent = (props) => (
        <ListPage
            config={listViews[nome]}
            detailReturnLabel={props.detailReturnLabel}
            onSelect={props[selectProp(nome)]}
        />
    );

    ListComponent.displayName = `${nome}List`;
    return ListComponent;
};

// Un elenco per ogni vista dichiarata. Gli edifici hanno il proprio, con la
// mappa; per tutti gli altri il componente e lo stesso, cambia la configurazione.
export const listComponents = Object.fromEntries(
    Object.keys(listViews).map((nome) => [nome, nome === 'edifici' ? EdificioList : createListComponent(nome)]),
);
