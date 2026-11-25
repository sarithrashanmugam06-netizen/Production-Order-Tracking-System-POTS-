import { createContext, useContext, useEffect, useState } from "react";

import api, { clearSession, getToken, setToken } from "../services/api";

const AuthContext = createContext(null);

const USER_KEY = "user";

// Keep only what the UI needs.
const toSessionUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// Restore the session after a page refresh (only if there is also a token).
function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw && getToken() ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  // Re-check with the server on load: picks up role changes, and an expired
  // or deactivated account is signed out by the API client.
  useEffect(() => {
    if (!getToken()) return;

    api
      .get("/auth/me")
      .then((response) => {
        const fresh = toSessionUser(response.data);
        setUser(fresh);
        localStorage.setItem(USER_KEY, JSON.stringify(fresh));
      })
      .catch(() => {});
  }, []);

  const login = ({ user: userData, token }) => {
    const sessionUser = toSessionUser(userData);

    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
