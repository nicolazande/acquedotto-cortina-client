import React from 'react';
import DetailPage from './DetailPage';
import { detailViews } from '../../config/detailViews';

const createDetailComponent = (resourceKey) => {
    const DetailComponent = () => <DetailPage config={detailViews[resourceKey]} />;

    DetailComponent.displayName = `${resourceKey}Details`;
    return DetailComponent;
};

export const detailComponents = {
    articoli: createDetailComponent('articoli'),
    clienti: createDetailComponent('clienti'),
    contatori: createDetailComponent('contatori'),
    edifici: createDetailComponent('edifici'),
    fasce: createDetailComponent('fasce'),
    fatture: createDetailComponent('fatture'),
    letture: createDetailComponent('letture'),
    listini: createDetailComponent('listini'),
    scadenze: createDetailComponent('scadenze'),
    servizi: createDetailComponent('servizi'),
};
