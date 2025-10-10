import { API_BASE } from '../api/client';

function getAuthToken() {
  try {
    const token = localStorage.getItem('token');
    if (token) return token;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.token : null;
  } catch {
    return null;
  }
}

export async function downloadApiFile(path, filename) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to download (${res.status})`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
