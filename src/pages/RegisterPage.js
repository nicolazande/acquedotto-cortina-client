import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import authApi from '../api/authApi';
import Button from '../components/shared/Button';
import ServerStatusIndicator from '../ServerStatusIndicator';
import '../styles/Auth.css';

const RegisterPage = ({ history }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authApi.register({ username, password });
            history.push('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Errore durante la registrazione.';
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-page">
            <ServerStatusIndicator />
            <div className="auth-container">
                <h2>Crea account</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleRegister}>
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
                        <Button type="submit" variant="primary" icon="plus">
                            Registrati
                        </Button>
                    </div>
                </form>
                <div className="auth-footer">
                    <Link to="/login">Hai gia' un account? Accedi</Link>
                </div>
            </div>
        </div>
    );
};

RegisterPage.propTypes = {
    history: PropTypes.object.isRequired,
};

export default RegisterPage;
