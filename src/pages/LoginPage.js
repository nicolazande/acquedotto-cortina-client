import React, { useState } from 'react';
import axios from 'axios';
import '../styles//Auth.css';

const API_URL = `${process.env.REACT_APP_API_URL}/api/auth/login`;

const LoginPage = ({ onLogin, history }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}`, { username, password });
            localStorage.setItem('token', response.data.token);
            onLogin(); // Aggiorna lo stato di autenticazione nell'App
            history.push('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Login</h2>
                {error && <p>{error}</p>}
                <form onSubmit={handleLogin}>
                    <div>
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <div>
                    <a href="/register">Non hai un account? Registrati</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
