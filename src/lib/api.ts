import { PUBLIC_API_BASE } from "$env/static/public";

const API_BASE = PUBLIC_API_BASE || "";

// fetch CSRF token
async function getCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/csrf-tok`, {
      credentials: "include",
    });
    // Get token from header
    return res.headers.get("x-csrf-token");
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    return null;
  }
}

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

  const csrfToken = await getCsrfToken();
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
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

// Helper function to get session values
export async function getSessionValues(keys: string[]): Promise<Record<string, any>> {
  try {
    const response = await post<{ session_values: Record<string, any> }>(
      '/api/user/session/values',
      { keys: keys },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.session_values;
  } catch (error) {
    throw new Error('Failed to fetch session values');
  }
}

// Helper function to get current user NRP from session
export async function getCurrentUserNrp(): Promise<string | null> {
  try {
    const sessionValues = await getSessionValues(['nrp']);
    const nrp = sessionValues.nrp;
    
    // Check if NRP is valid (not the "UNKNOWN KEY or EMPTY STRING" response)
    if (nrp && nrp !== "UNKNOWN KEY or EMPTY STRING") {
      return nrp as string;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user NRP from session:', error);
    return null;
  }
}

// Helper function to get current user info (NRP and name) from session
export async function getCurrentUserInfo(): Promise<{nrp: string; name: string} | null> {
  try {
    const sessionValues = await getSessionValues(['nrp', 'name']);
    const nrp = sessionValues.nrp;
    const name = sessionValues.name;
    
    // Check if both values are valid
    if (nrp && nrp !== "UNKNOWN KEY or EMPTY STRING" && 
        name && name !== "UNKNOWN KEY or EMPTY STRING") {
      return {
        nrp: nrp as string,
        name: name as string
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user info from session:', error);
    return null;
  }
}

// Helper function to get user biodata
export async function getUserBiodata(): Promise<{nrp: string; name: string; line_id: string; phone: string} | null> {
  try {
    const response = await get<{ data: {nrp: string; name: string; line_id: string; phone: string} }>('/api/user/biodata');
    return response.data;
  } catch (error) {
    console.error('Error fetching user biodata:', error);
    return null;
  }
}

// Helper function to update user biodata
export async function updateUserBiodata(lineId: string, phone: string): Promise<{success: boolean; message: string}> {
  try {
    const response = await post<{ message: string; data: any }>('/api/user/biodata', {
      line_id: lineId,
      phone: phone
    });
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    console.error('Error updating user biodata:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update biodata'
    };
  }
}

// Slot reservation functions
export async function reserveSlot(ukmId: string): Promise<{reservation_id: string; expires_at: string}> {
  return post('/api/registrations/reserve', { ukm_id: ukmId });
}

export async function checkUserReservation(ukmId: string): Promise<{has_reservation: boolean; is_expired: boolean; reservation_id?: string; expires_at?: string}> {
  return get(`/api/registrations/check-reservation/${ukmId}`);
}

export async function registerWithReservation(reservationId: string, registrationData: {
  ukm_id: string;
  payment: File | string | null;
  drive_url: string;
}): Promise<{message: string; registration: any; reservation_id: string}> {
  const formData = new FormData();
  formData.append('ukm_id', registrationData.ukm_id);
  formData.append('drive_url', registrationData.drive_url);
  
  // Handle payment file
  if (registrationData.payment && registrationData.payment instanceof File) {
    formData.append('payment', registrationData.payment);
  }
  
  return post<{message: string; registration: any; reservation_id: string}>(`/api/registrations/with-reservation/${reservationId}`, formData);
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

  const csrfToken = await getCsrfToken();
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
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
  const headers = new Headers(init?.headers);
  
  // Add CSRF token to headers
  const csrfToken = await getCsrfToken();
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
    ...init,
    headers,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  // @ts-ignore
  return text ? JSON.parse(text) : undefined;
}
