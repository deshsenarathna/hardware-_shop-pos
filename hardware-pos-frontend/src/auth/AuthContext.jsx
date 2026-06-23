import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedAuth = sessionStorage.getItem("hardwarePosAuth");

    if (!savedAuth) {
      return null;
    }

    try {
      return JSON.parse(savedAuth);
    } catch {
      sessionStorage.removeItem("hardwarePosAuth");
      return null;
    }
  });

  function login(loginResponse) {
    const authenticatedUser = {
      userId: loginResponse.userId,
      fullName: loginResponse.fullName,
      username: loginResponse.username,
      role: loginResponse.role,
      token: loginResponse.token,
    };

    sessionStorage.setItem(
      "hardwarePosAuth",
      JSON.stringify(authenticatedUser)
    );

    setUser(authenticatedUser);
  }

  function logout() {
    sessionStorage.removeItem("hardwarePosAuth");
    setUser(null);
  }

  const value = {
    user,
    token: user?.token ?? null,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user?.token),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}