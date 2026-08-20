import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../shared/Icon';

// Un numero che conta, con sotto la frase che dice cosa farne. Cliccabile:
// porta alla lista gia filtrata, cosi il dato e il punto di partenza di un'azione.
const StatCard = ({ detail, icon, label, to, tone = 'neutral', value }) => (
    <Link className={`stat-card stat-card-${tone}`} to={to}>
        <span className="stat-card-head">
            <span className="stat-card-mark"><Icon name={icon} /></span>
            <span className="stat-card-label">{label}</span>
        </span>
        <strong className="stat-card-value">{value}</strong>
        <span className="stat-card-detail">{detail}</span>
    </Link>
);

export default StatCard;
