import React from 'react';
import { formatDate } from '../../utils/formatters';

// Ultime modifiche registrate: rende visibile chi ha toccato cosa, soprattutto
// sulle tariffe, dove prima non restava alcuna traccia.
const orario = (valore) => {
    const data = new Date(valore);
    return Number.isNaN(data.getTime())
        ? ''
        : data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

const ActivityList = ({ voci = [] }) => {
    if (voci.length === 0) {
        return <p className="dashboard-empty">Nessuna modifica registrata.</p>;
    }

    return (
        <ul className="activity-list">
            {voci.map((voce) => (
                <li key={voce._id} className="activity-row">
                    <span className="activity-when">
                        {formatDate(voce.createdAt)} {orario(voce.createdAt)}
                    </span>
                    <span className="activity-what">{voce.summary || voce.action}</span>
                    {voce.actorUsername && <span className="activity-who">{voce.actorUsername}</span>}
                </li>
            ))}
        </ul>
    );
};

export default ActivityList;
