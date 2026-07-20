import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('name');
        if (token && role !== 'team') {
            setUser({ role, name });
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const loginTeacher = async (usernameOrEmail, password) => {
        const response = await api.post('/auth/token', `username=${usernameOrEmail}&password=${password}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const { access_token, role, username } = response.data;
        const displayName = username || usernameOrEmail;
        localStorage.setItem('token', access_token);
        localStorage.setItem('role', role);
        localStorage.setItem('name', displayName);
        setUser({ role, name: displayName });
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    };

    const registerTeacher = async (username, password, email = null) => {
        const payload = { username, password, role: 'teacher' };
        if (email) payload.email = email;
        await api.post('/auth/register', payload);
        await loginTeacher(username, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginTeacher, registerTeacher, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
