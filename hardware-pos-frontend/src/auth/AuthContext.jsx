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
      refreshToken: loginResponse.refreshToken,
    };

    sessionStorage.setItem(
      "hardwarePosAuth",
      JSON.stringify(authenticatedUser)
    );

    setUser(authenticatedUser);
  }

  function updateTokens(accessToken, refreshToken) {
  setUser((prev) => {
    if (!prev) return null;
    const updated = { ...prev, token: accessToken, refreshToken };
    sessionStorage.setItem("hardwarePosAuth", JSON.stringify(updated));
    return updated;
  });
}

  function logout() {
  const savedAuth = sessionStorage.getItem("hardwarePosAuth");
  if (savedAuth) {
    try {
      const auth = JSON.parse(savedAuth);
      if (auth.refreshToken) {
        apiClient.post("/auth/logout", { refreshToken: auth.refreshToken }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }
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
    updateTokens,
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