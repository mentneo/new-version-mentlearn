import { getAuth } from "firebase/auth";

// Simple API helper (swap to production base when deployed)
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export const apiRequest = async (path, options = {}, token) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
};

export const AuthAPI = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me:   (token) => apiRequest('/auth/me', {}, token)
};

export const JobsAPI = {
  list: (query = '') => apiRequest(`/jobs${query ? `?q=${encodeURIComponent(query)}` : ''}`),
};

async function fetchWithAuth(url, options = {}) {
  const auth = getAuth();
  const user = auth.currentUser;
  let headers = { ...options.headers, 'Content-Type': 'application/json' };

  if (user) {
    const idToken = await user.getIdToken();
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  return fetch(url, { ...options, headers });
}

// Usage example for /preferences:
// fetchWithAuth('/preferences')
//   .then(res => res.json())
//   .then(data => console.log(data));
