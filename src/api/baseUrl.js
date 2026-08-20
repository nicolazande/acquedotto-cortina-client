const normalizeApiBaseUrl = (value) => {
    if (!value) {
        return '';
    }

    return value.replace(/\/+$/, '').replace(/\/api$/, '');
};

// Vite espone le variabili d'ambiente su import.meta.env. Sono accettati sia
// VITE_API_URL sia REACT_APP_API_URL, cosi la configurazione gia presente sul
// servizio di hosting continua a funzionare senza modifiche.
const configuredApiUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL;

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiUrl);

export const apiUrl = (resourcePath) => {
    const normalizedPath = resourcePath.replace(/^\/+/, '');
    return `${API_BASE_URL}/api/${normalizedPath}`;
};
