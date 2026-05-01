import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ethara_token');
    if (token) {
      api.me().then(setUser).catch(() => localStorage.removeItem('ethara_token')).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem('ethara_token', token);
    setUser(user); return user;
  };
  const signup = async (name, email, password, role) => {
    const { token, user } = await api.signup({ name, email, password, role });
    localStorage.setItem('ethara_token', token);
    setUser(user); return user;
  };
  const logout = () => { localStorage.removeItem('ethara_token'); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, signup, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
