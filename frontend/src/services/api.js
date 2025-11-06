import { AuthService } from './auth';

const API_URL = 'http://localhost:3001';

const api = {
  async get(url) {
    const token = AuthService.getToken();
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }
    return response.json();
  },

  async post(url, data) {
    const token = AuthService.getToken();
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }
    return response.json();
  },

  async put(url, data) {
    const token = AuthService.getToken();
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }
    return response.json();
  },

  async delete(url) {
    const token = AuthService.getToken();
    const response = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }
    return response.json();
  },

  async patch(url, data) {
    const token = AuthService.getToken();
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }
    return response.json();
  }
};

export default api;