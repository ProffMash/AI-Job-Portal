import axios from 'axios';

// const API_BASE = 'http://localhost:8000/api';
const API_BASE = 'https://ai-job-portal-r30p.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`; // DRF TokenAuthentication uses 'Token <key>'
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Simple in-memory cache
const cache: Map<string, { data: unknown; timestamp: number }> = new Map();

export async function cachedGet<T>(
  url: string,
  params?: Record<string, unknown>,
  ttlSeconds: number = 60
): Promise<T> {
  const cacheKey = `${url}?${JSON.stringify(params || {})}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttlSeconds * 1000) {
    return cached.data as T;
  }

  const response = await api.get<T>(url, { params });
  cache.set(cacheKey, { data: response.data, timestamp: now });
  return response.data;
}

export function invalidateCacheFor(url: string, params?: Record<string, unknown>) {
  const cacheKey = `${url}?${JSON.stringify(params || {})}`;
  cache.delete(cacheKey);
}

export function clearCache() {
  cache.clear();
}

export default api;
