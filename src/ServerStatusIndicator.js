import React, { useEffect, useState } from 'react';
import './styles/ServerStatusIndicator.css';
import authApi from './api/authApi';

const ServerStatusIndicator = () => {
    const [isServerAvailable, setIsServerAvailable] = useState(false);

    useEffect(() => {
        // Il controllo prosegue anche dopo il primo esito positivo: prima l'intervallo
        // veniva fermato appena l'API rispondeva, e l'indicatore restava su "online"
        // per sempre anche se il server cadeva subito dopo.
        const checkServerStatus = async () => {
            try {
                await authApi.healthCheck();
                setIsServerAvailable(true);
            } catch {
                setIsServerAvailable(false);
            }
        };

        const intervalId = setInterval(checkServerStatus, 5000);
        checkServerStatus();

        return () => clearInterval(intervalId);
    }, []);

    const statusLabel = isServerAvailable ? 'API online' : 'API offline';

    return (
        <div
            className={`server-status-indicator ${isServerAvailable ? 'is-online' : 'is-offline'}`}
            role="status"
            aria-label={statusLabel}
            title={statusLabel}
        >
            <span className="status-circle" aria-hidden="true" />
            <span className="status-label">API</span>
        </div>
    );
};

export default ServerStatusIndicator;
