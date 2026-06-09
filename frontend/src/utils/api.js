const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

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

export const fetchFriends = async () => {
  return fetch(`${BASE_URL}/friends/list`, {
    method: 'GET',
    headers: getHeaders()
  });
};

export const fetchFriendRequests = async () => {
  return fetch(`${BASE_URL}/friends/requests`, {
    method: 'GET',
    headers: getHeaders()
  });
};

export const sendFriendRequest = async (email) => {
  return fetch(`${BASE_URL}/friends/request/send`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });
};

export const acceptFriendRequest = async (senderId) => {
  return fetch(`${BASE_URL}/friends/request/accept`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ senderId })
  });
};

export const declineFriendRequest = async (senderId) => {
  return fetch(`${BASE_URL}/friends/request/decline`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ senderId })
  });
};

export const fetchChats = async (friendId) => {
  return fetch(`${BASE_URL}/friends/chats/${friendId}`, {
    method: 'GET',
    headers: getHeaders()
  });
};

export const sendMessage = async (friendId, message) => {
  return fetch(`${BASE_URL}/friends/message/send`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ friendId, message })
  });
};

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userName');
};
