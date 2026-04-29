export const apiRequest = async (url, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem('token');
    if (typeof window !== 'undefined') window.location.href = '/login';
  }

  return data;
};