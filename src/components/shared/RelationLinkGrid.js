import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getRelationLinks } from '../../config/relationViews';
import { getResourceIcon } from '../../config/resourceMeta';
import { getContextBackSearch } from '../../hooks/useContextBack';
import Icon from './Icon';
import { puoAprire, useRisorsePermesse } from '../../hooks/useRisorsePermesse';

const RelationLinkGrid = ({ resource, recordId, relations }) => {
    const location = useLocation();
    const risorse = useRisorsePermesse();
    // Un collegamento verso una risorsa che il ruolo non puo aprire porterebbe
    // a un errore di permessi: meglio non offrirlo. E il caso del riquadro
    // Fatture sulla scheda cliente, o di Listino su quella di un contatore.
    // Si filtra sulla risorsa di destinazione e non sulla chiave: la chiave e
    // spesso singolare (`cliente`, `listino`) mentre le risorse sono plurali, e
    // confonderle nasconderebbe il cliente sulla scheda di un contatore, che
    // invece serve a chi va a leggerlo.
    const links = getRelationLinks(resource, relations)
        .filter((link) => puoAprire(risorse, link.targetResource));
    const contextSearch = getContextBackSearch(location.search);

    if (!recordId || links.length === 0) {
        return null;
    }

    return (
        <section className="relation-link-panel" aria-label="Collegamenti">
            <div className="relation-link-heading">
                <span className="eyebrow">Relazioni</span>
                <h3>Collegamenti</h3>
            </div>
            <div className="relation-link-grid">
                {links.map((link) => (
                    <Link
                        className="relation-link-card"
                        to={`/${resource}/${recordId}/${link.key}${contextSearch}`}
                        key={link.key}
                    >
                        <span className="relation-link-icon">
                            <Icon name={getResourceIcon(link.targetResource)} />
                        </span>
                        <span className="relation-link-title">{link.title}</span>
                        <span className="relation-link-description">{link.description}</span>
                        <span className="relation-link-action">Apri vista <Icon name="arrowRight" size={14} /></span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default RelationLinkGrid;
