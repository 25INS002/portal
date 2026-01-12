import axios from "axios";

// Backend URL (VPS or localhost)
const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${backendUrl}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// -----------------------------
// Token handling (localStorage)
// -----------------------------
let accessToken: string | null =
  typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;

  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }
};

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token") || accessToken;
  }
  return accessToken;
};

// -----------------------------
// Axios interceptor
// -----------------------------
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
