import React, { useState } from 'react';
import PropTypes from 'prop-types';
import authApi from '../api/authApi';
import '../styles/Auth.css';

const LoginPage = ({ onLogin, history }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear any existing errors
        try {
            const response = await authApi.login({ username, password });
            localStorage.setItem('token', response.data.token);
            onLogin(); // Update authentication state in App
            history.push('/'); // Redirect to home page
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Invalid credentials';
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Login</h2>
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
                            Login
                        </button>
                    </div>
                </form>
                <div className="auth-footer">
                    <a href="/register">Non hai un account? Registrati</a>
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
