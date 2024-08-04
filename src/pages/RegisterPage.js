import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

const API_URL = `${process.env.REACT_APP_API_URL}/api/auth/register`;

const RegisterPage = ({ history }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}`, { username, password });
            history.push('/login');
        } catch (err) {
            setError('Error registering user');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Register</h2>
                {error && <p>{error}</p>}
                <form onSubmit={handleRegister}>
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
                    <button type="submit">Register</button>
                </form>
                <div>
                    <a href="/login">Hai già un account? Accedi</a>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
