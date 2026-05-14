import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getRelationLinks } from '../../config/relationViews';
import { getResourceIcon } from '../../config/resourceMeta';
import { getContextBackSearch } from '../../hooks/useContextBack';
import Icon from './Icon';

const RelationLinkGrid = ({ resource, recordId, relations }) => {
    const location = useLocation();
    const links = getRelationLinks(resource, relations);
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
