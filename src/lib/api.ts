import { PUBLIC_API_BASE } from '$env/static/public';

const API_BASE = PUBLIC_API_BASE || '';

export async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

