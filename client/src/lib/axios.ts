import axios from "axios";

if (!axios.defaults.baseURL) {
    axios.defaults.baseURL = "http://localhost:3000";
    console.log("Base URL set to http://localhost:3000 becz env was missing");
}

const api = axios.create(
    {
        baseURL: import.meta.baseURL,
        withCredentials: true, // include cookies if your backend uses sessions
        headers: {
            "Content-Type": "application/json",
        }

    }
)
    
// Request interceptor — attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;