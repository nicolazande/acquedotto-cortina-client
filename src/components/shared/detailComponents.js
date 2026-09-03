import React from 'react';
import DetailPage from './DetailPage';
import { detailViews } from '../../config/detailViews';

const createDetailComponent = (nome) => {
    const DetailComponent = () => <DetailPage config={detailViews[nome]} />;

    DetailComponent.displayName = `${nome}Details`;
    return DetailComponent;
};

// Una scheda per ogni vista dichiarata: non c'e niente da scegliere, quindi non
// c'e niente da elencare.
export const detailComponents = Object.fromEntries(
    Object.keys(detailViews).map((nome) => [nome, createDetailComponent(nome)]),
);
