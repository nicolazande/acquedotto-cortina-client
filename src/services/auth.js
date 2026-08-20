import axios from 'axios';

const LOGIN_PATH = '/login';
const SESSION_MESSAGE_KEY = 'sessionMessage';

const messaggiSessione = {
    token_expired: 'Sessione scaduta: accedi di nuovo.',
    account_disabled: 'Account disabilitato: contatta un amministratore.',
    invalid_token: 'Sessione non valida: accedi di nuovo.',
    user_not_found: 'Utente non piu disponibile: accedi di nuovo.',
};

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Il server risponde 401 a ogni esito di autenticazione fallita (token assente,
// scaduto o non valido): qui la sessione viene chiusa e l'utente riportato al
// login con il motivo, invece di restare su una pagina che non carica piu nulla.
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const reason = error.response?.data?.reason;
        const sessioneChiusa = status === 401 || reason === 'account_disabled';

        if (sessioneChiusa) {
            localStorage.removeItem('token');
            sessionStorage.setItem(SESSION_MESSAGE_KEY, messaggiSessione[reason] || messaggiSessione.invalid_token);

            if (window.location.pathname !== LOGIN_PATH) {
                window.location.assign(LOGIN_PATH);
            }
        }

        return Promise.reject(error);
    }
);

export const consumeSessionMessage = () => {
    const message = sessionStorage.getItem(SESSION_MESSAGE_KEY);
    if (message) {
        sessionStorage.removeItem(SESSION_MESSAGE_KEY);
    }
    return message || '';
};

export default axios;
