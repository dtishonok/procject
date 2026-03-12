import { useState, useEffect, useCallback } from "react";

export const useAuth = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const login = useCallback((jwtToken, id, adminStatus = false) => {
    setToken(jwtToken);
    setUserId(id);
    setIsAdmin(adminStatus);
    localStorage.setItem("userData", JSON.stringify({ 
      userId: id, 
      token: jwtToken, 
      isAdmin: adminStatus 
    }));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setIsAdmin(false);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("userData"));
    if (data && data.token) {
      login(data.token, data.userId, data.isAdmin || false);
    }
    setIsReady(true);
  }, [login]);

  return { login, logout, token, userId, isAdmin, isReady };
};