import React, { useState } from 'react';
import PropTypes from 'prop-types';
import authApi from '../api/authApi';
import '../styles/Auth.css';

const RegisterPage = ({ history }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); // Clear any existing errors
        try {
            await authApi.register({ username, password });
            history.push('/login'); // Redirect to login on successful registration
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'An unexpected error occurred during registration.';
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Register</h2>
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
                        <button type="submit" className="btn btn-primary">
                            Register
                        </button>
                    </div>
                </form>
                <div className="auth-footer">
                    <a href="/login">Already have an account? Log in</a>
                </div>
            </div>
        </div>
    );
};

RegisterPage.propTypes = {
    history: PropTypes.object.isRequired,
};

export default RegisterPage;
