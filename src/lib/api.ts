import { PUBLIC_API_BASE } from "$env/static/public";

const API_BASE = PUBLIC_API_BASE || "";

export async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function post<T, U = object>(
  path: string,
  body: U,
  init?: RequestInit,
): Promise<T> {
  const isJson = !(body instanceof FormData);

  const headers = new Headers(init?.headers);
  if (isJson && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const fullUrl = `${API_BASE}${path}`;
  console.log('POST URL:', fullUrl);
  console.log('Body type:', body instanceof FormData ? 'FormData' : 'JSON');

  const res = await fetch(fullUrl, {
    method: "POST",
    credentials: "include",
    ...init,
    headers,
    body: isJson ? JSON.stringify(body) : (body as any),
  });

  const text = await res.text();
  if (!res.ok) {
    // Same robust error handling as GET
    try {
      const jsonError = JSON.parse(text);
      throw new Error(jsonError.error || jsonError.message || text);
    } catch {
      throw new Error(text);
    }
  }

  // If successful, parse the text as JSON. Handle empty responses.
  // @ts-ignore
  return text ? JSON.parse(text) : undefined;
}

export async function put<T, U = object>(
  path: string,
  body: U,
  init?: RequestInit,
): Promise<T> {
  const isJson = !(body instanceof FormData);

  const headers = new Headers(init?.headers);
  if (isJson && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    credentials: "include",
    ...init,
    headers,
    body: isJson ? JSON.stringify(body) : (body as any),
  });
  
  const text = await res.text();
  if (!res.ok) {
    try {
      const jsonError = JSON.parse(text);
      throw new Error(jsonError.error || jsonError.message || text);
    } catch {
      throw new Error(text);
    }
  }
  // @ts-ignore
  return text ? JSON.parse(text) : undefined;
}

export async function del<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
    ...init,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  // @ts-ignore
  return text ? JSON.parse(text) : undefined;
}
