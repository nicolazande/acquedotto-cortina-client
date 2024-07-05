// client/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [token]);

    const login = async (username, password) => {
        const response = await axios.post('/api/login', { username, password });
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setIsLoading(false);
    };

    const register = async (username, password) => {
        await axios.post('/api/register', { username, password });
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    const isAuthenticated = () => !!token;

    return (
        <AuthContext.Provider value={{ token, login, register, logout, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
