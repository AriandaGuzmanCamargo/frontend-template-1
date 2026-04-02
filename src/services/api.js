const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"; // Importante colocar la url de tu api

const parseJsonSafe = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const buildApiError = async (response) => {
  const data = await parseJsonSafe(response);
  const message = data?.message || data?.error || data?.detalle || `Error HTTP: ${response.status}`;
  const error = new Error(message);
  error.status = response.status;
  error.data = data;
  throw error;
};

export const api = {
  get: async (endpoint) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!response.ok) await buildApiError(response);
      return await parseJsonSafe(response);
    } catch (error) {
      console.error("Error en GET:", error);
      throw error;
    }
  },

  post: async (endpoint, body) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) await buildApiError(response);
      return await parseJsonSafe(response);
    } catch (error) {
      console.error("Error en POST:", error);
      throw error;
    }
  }
};

