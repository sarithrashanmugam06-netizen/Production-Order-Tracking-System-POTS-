import axios from "axios";

// Set VITE_API_URL in frontend/.env to point at a different backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// Turns a FastAPI error response into one readable sentence for a toast.
export function getErrorMessage(error, fallback = "Something went wrong") {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        const field = Array.isArray(item.loc)
          ? item.loc.filter((part) => part !== "body").join(".")
          : "";
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join("; ");
  }

  if (error?.code === "ERR_NETWORK") {
    return "Cannot reach the server. Is the backend running?";
  }

  return fallback;
}

// ---- Sign-in token -------------------------------------------------------
// Kept in localStorage so a refresh keeps you signed in. Trade-off: any script
// running on the page could read it, so keep the app free of untrusted scripts
// and serve it over HTTPS in production.
const TOKEN_KEY = "pots_token";
const USER_KEY = "user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Expired or revoked session: clear it and go to the login page.
// (A failed login attempt is also a 401, but must stay on the form.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      clearSession();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
