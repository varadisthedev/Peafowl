import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => {
    console.log("[API] POST /api/users/register", data);
    return api.post("/api/users/register", data);
  },
  login: (data) => {
    console.log("[API] POST /api/users/login", data);
    return api.post("/api/users/login", data);
  },
  getProfile: () => {
    console.log("[API] GET /api/users/profile");
    return api.get("/api/users/profile");
  },
};

export const messageAPI = {
  getMessagesByRoom: (roomId, limit = 50, skip = 0) => {
    console.log(
      `[API] GET /api/messages/room/${roomId}?limit=${limit}&skip=${skip}`,
    );
    return api.get(`/api/messages/room/${roomId}`, { params: { limit, skip } });
  },
  deleteMessage: (messageId) => {
    console.log(`[API] DELETE /api/messages/${messageId}`);
    return api.delete(`/api/messages/${messageId}`);
  },
  editMessage: (messageId, content) => {
    console.log(`[API] PUT /api/messages/${messageId}`, { content });
    return api.put(`/api/messages/${messageId}`, { content });
  },
};

export default api;
