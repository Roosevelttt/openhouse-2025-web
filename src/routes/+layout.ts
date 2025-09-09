export const prerender = false;
export const ssr = true;

import { PUBLIC_API_BASE } from "$env/static/public";

// Fetch CSRF token from the backend
async function getCsrfToken() {
  const res = await fetch(`${PUBLIC_API_BASE}/api/csrf-tok`, {
    credentials: "include",
  });
  // Try to get token from header first
  let token = res.headers.get("x-csrf-token");
  if (!token) {
    // Fallback: try to get from JSON body
    const data = await res.json();
    token = data.csrfToken;
  }
  return token;
}

// Fetch session values with CSRF token
async function session(keysArray: string[]) {
  let sessionValues = {};
  const csrfToken = await getCsrfToken();

  if (!csrfToken) {
    console.error("Failed to fetch CSRF token");
    return null;
  }

  try {
    const response = await fetch(`${PUBLIC_API_BASE}/api/user/session/values`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ keys: keysArray }),
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      sessionValues = data.session_values;
      return sessionValues;
    } else {
      const errData = await response.json();
      let error = errData.error || "Failed to get session values.";
      console.log(error);
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

(async () => {
  const values = await session([
    "nrp",
    "role",
    "admin_ukm_id",
    "admin_ukm_name",
    "admin_division_id",
    "admin_division_slug",
  ]);
  console.log("Session values:", values);
})();