import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add JWT automatically to protected requests
apiClient.interceptors.request.use(
  (config) => {
    const savedAuth = sessionStorage.getItem("hardwarePosAuth");

    if (savedAuth) {
      try {
        const authenticatedUser = JSON.parse(savedAuth);

        if (authenticatedUser.token) {
          config.headers.Authorization =
            `Bearer ${authenticatedUser.token}`;
        }
      } catch {
        sessionStorage.removeItem("hardwarePosAuth");
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;