import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import authApi from '../api/authApi';
import { consumeSessionMessage } from '../services/auth';
import Button from '../components/shared/Button';
import ServerStatusIndicator from '../ServerStatusIndicator';
import '../styles/Auth.css';
import descriviErrore from '../api/descriviErrore';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    // Se la sessione e stata chiusa dal server (token scaduto, account disabilitato)
    // l'utente arriva qui senza sapere perche: il motivo viene mostrato una volta sola.
    useEffect(() => {
        setNotice(consumeSessionMessage());
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await authApi.login({ username, password });
            localStorage.setItem('token', response.data.token);
            // Dove si atterra lo decide App, che conosce la pagina iniziale di
            // ogni ruolo: deciderlo anche qui voleva dire due regole, e infatti
            // dicevano cose diverse - il letturista finiva sulla panoramica,
            // che non puo nemmeno caricare.
            await onLogin();
        } catch (err) {
            const errorMessage = descriviErrore(err, 'Credenziali non valide');
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-page">
            <ServerStatusIndicator />
            <div className="auth-container">
                <h2>Accedi</h2>
                {notice && !error && <p className="notice-message">{notice}</p>}
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="btn-back-container">
                        <Button type="submit" variant="primary" icon="check">
                            Accedi
                        </Button>
                    </div>
                </form>
                <div className="auth-footer">
                    <Link to="/register">Non hai un account? Registrati</Link>
                </div>
            </div>
        </div>
    );
};

LoginPage.propTypes = {
    onLogin: PropTypes.func.isRequired,
};

export default LoginPage;
