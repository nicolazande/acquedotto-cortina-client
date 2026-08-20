import React from 'react';

// Segnaposto mostrato mentre una pagina caricata su richiesta arriva dalla rete.
// Occupa spazio simile al contenuto reale, cosi la pagina non "salta" quando compare.
const PageLoading = ({ label = 'Caricamento...' }) => (
    <div className="page-loading" role="status" aria-live="polite">
        <span className="visually-hidden">{label}</span>
        <span className="skeleton-line skeleton-line-short" aria-hidden="true" />
        <span className="skeleton-line skeleton-line-wide" aria-hidden="true" />
        <span className="skeleton-line" aria-hidden="true" />
        <span className="skeleton-line" aria-hidden="true" />
    </div>
);

export default PageLoading;
