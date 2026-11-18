import { createContext, useEffect, useState } from "react";
import { registerUser, loginUser, getCurrentUser } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = ({ data }) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (formData) => handleAuth(await registerUser(formData));
  const login = async (formData) => handleAuth(await loginUser(formData));

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}