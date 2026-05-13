import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import authApi from '../api/authApi';
import ServerStatusIndicator from '../ServerStatusIndicator';
import '../styles/Auth.css';

const LoginPage = ({ onLogin, history }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await authApi.login({ username, password });
            localStorage.setItem('token', response.data.token);
            onLogin();
            history.push('/');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Credenziali non valide';
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-page">
            <ServerStatusIndicator />
            <div className="auth-container">
                <h2>Accedi</h2>
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
                        <button type="submit" className="btn btn-primary">
                            Accedi
                        </button>
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
    history: PropTypes.object.isRequired,
};

export default LoginPage;
