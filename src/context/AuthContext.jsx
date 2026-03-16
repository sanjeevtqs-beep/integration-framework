import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app we would validate the token with the backend here
        if (token) {
            try {
                // Decode payload for user info (simple JWT decode)
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: payload?.id,
                    name: payload?.name || 'User',
                    role: payload?.role || 'User'
                });
            } catch (e) {
                console.error("Invalid token format", e);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
