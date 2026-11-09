
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("sweety_token");
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const { user: loggedInUser, token } = response.data.data;

    localStorage.setItem("sweety_token", token);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    const { user: registeredUser, token } = response.data.data;

    localStorage.setItem("sweety_token", token);
    setUser(registeredUser);

    return registeredUser;
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("sweety_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.data.user);
      } catch {
        localStorage.removeItem("sweety_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
