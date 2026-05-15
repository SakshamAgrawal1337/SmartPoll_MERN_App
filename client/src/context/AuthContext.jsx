import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authAPI } from "../lib/api";

const Ctx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify token via /auth/me
  useEffect(() => {
    const token = localStorage.getItem("sp_token");
    if (!token) { setLoading(false); return; }

    authAPI.me()
      .then((r) => {
        // GET /auth/me → { success, data: { user } }
        setUser(r.data.data?.user ?? r.data.data);
      })
      .catch(() => {
        localStorage.removeItem("sp_token");
      })
      .finally(() => setLoading(false));
  }, []);

  // POST /auth/register → { success, data: { name, email, ... } } NO token
  const register = useCallback(async (name, email, password) => {
    const r = await authAPI.register({ name, email, password });
    // No token returned — user must login after register
    return r.data; // return message so page can show it
  }, []);

  // POST /auth/login → { success, data: { accessToken, user } }
  const login = useCallback(async (email, password) => {
    const r = await authAPI.login({ email, password });
    const { accessToken, user } = r.data.data;
    localStorage.setItem("sp_token", accessToken);
    setUser(user);
    return user;
  }, []);

  // POST /auth/logout
  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch (_) {}
    localStorage.removeItem("sp_token");
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
