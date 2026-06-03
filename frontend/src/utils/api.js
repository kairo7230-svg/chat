const BASE_URL = 'http://localhost:9000';

const getToken = () => localStorage.getItem('authToken');

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const signupRequest = async (payload) => {
  return fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
};

export const loginRequest = async (payload) => {
  return fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
};

export const fetchProducts = async () => {
  return fetch(`${BASE_URL}/product`, {
    method: 'GET',
    headers: getHeaders(false)
  });
};

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userName');
};
