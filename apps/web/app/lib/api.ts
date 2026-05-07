/**
 * API client helper for the AI-Native University frontend.
 * All requests go through the Nginx reverse proxy:
 *   /api/* → NestJS API (port 4000)
 *   /ai/*  → AI Gateway (port 8000)
 */

const API_BASE = '/api';

export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data: T; message?: string }> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `API error: ${res.status}`);
  }

  return json;
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const result = await apiFetch<T>(path);
  return result.data;
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const result = await apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return result.data;
}

export async function apiPatch<T = any>(path: string, body: any): Promise<T> {
  const result = await apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return result.data;
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
