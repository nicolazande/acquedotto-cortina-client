import React, { useState, useEffect } from 'react';
import authApi from '../api/authApi';
import '../styles/Auth.css';

const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [numeroTelefono, setNumeroTelefono] = useState('');
    const [error, setError] = useState('');

    const fetchProfile = async () => {
        try {
            const response = await authApi.getProfile();
            setUsername(response.data.username || '');
            setEmail(response.data.email || '');
            setNumeroTelefono(response.data.numero_telefono || '');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Errore durante il recupero del profilo';
            setError(errorMessage);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authApi.updateProfile({
                username,
                password,
                email,
                numero_telefono: numeroTelefono,
            });
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Errore durante il salvataggio del profilo';
            setError(errorMessage);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Profilo Utente</h2>
                {error && <p className="error-message">{error}</p>}
                <table className="profile-table">
                    <tbody>
                        <tr>
                            <td>Username</td>
                            <td>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    readOnly={!isEditing}
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Password</td>
                            <td>
                                <input
                                    type="password"
                                    value={isEditing ? password : ''}
                                    onChange={(e) => setPassword(e.target.value)}
                                    readOnly={!isEditing}
                                    placeholder={!isEditing ? '••••••••' : ''}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    readOnly={!isEditing}
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Numero di Telefono</td>
                            <td>
                                <input
                                    type="tel"
                                    value={numeroTelefono}
                                    onChange={(e) => setNumeroTelefono(e.target.value)}
                                    readOnly={!isEditing}
                                    required
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="btn-back-container">
                    {isEditing ? (
                        <>
                            <button type="button" className="btn btn-primary" onClick={handleUpdate}>
                                Salva
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setIsEditing(false)}
                            >
                                Annulla
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-edit"
                            onClick={() => setIsEditing(true)}
                        >
                            Modifica
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
