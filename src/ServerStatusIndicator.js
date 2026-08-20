import React, { useEffect, useState } from 'react';
import './styles/ServerStatusIndicator.css';
import authApi from './api/authApi';
import { APP_VERSION } from './version';

const ServerStatusIndicator = () => {
    const [isServerAvailable, setIsServerAvailable] = useState(false);
    // La versione del server viene mostrata nel suggerimento: client e server
    // stanno su due servizi distinti e si aggiornano in momenti diversi, quindi
    // poter leggere al volo cosa gira davvero evita diagnosi a tentativi.
    const [versione, setVersione] = useState('');

    useEffect(() => {
        // Il controllo prosegue anche dopo il primo esito positivo: prima l'intervallo
        // veniva fermato appena l'API rispondeva, e l'indicatore restava su "online"
        // per sempre anche se il server cadeva subito dopo.
        const checkServerStatus = async () => {
            try {
                const risposta = await authApi.healthCheck();
                setIsServerAvailable(true);
                setVersione(risposta?.data?.version || '');
            } catch {
                setIsServerAvailable(false);
                setVersione('');
            }
        };

        const intervalId = setInterval(checkServerStatus, 5000);
        checkServerStatus();

        return () => clearInterval(intervalId);
    }, []);

    const statusLabel = isServerAvailable ? 'API online' : 'API offline';
    const dettaglio = [statusLabel, versione && `server ${versione}`, `interfaccia ${APP_VERSION}`]
        .filter(Boolean)
        .join(' · ');

    return (
        <div
            className={`server-status-indicator ${isServerAvailable ? 'is-online' : 'is-offline'}`}
            role="status"
            aria-label={dettaglio}
            title={dettaglio}
        >
            <span className="status-circle" aria-hidden="true" />
            <span className="status-label">API</span>
        </div>
    );
};

export default ServerStatusIndicator;
