export const prerender = false;
export const ssr = true;

import { PUBLIC_API_BASE } from "$env/static/public";

// buat ngambil value session
async function session(keysArray: string[]) {
  let sessionValues = {};

  try {
    const response = await fetch(`${PUBLIC_API_BASE}/api/user/session/values`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keys: keysArray }),
      credentials: "include", // This is essential to send the session cookie
    });

    if (response.ok) {
      const data = await response.json();
      sessionValues = data.session_values;
      return sessionValues;
    } else {
      const errData = await response.json();
      let error = errData.error || "Failed to get session values.";
      console.log(error);
      // logger.error(error);
      return null;
    }
  } catch (e) {
    // logger.error(e);
    console.error(e);
    return null;
  }
}

console.log(
  session([
    "nrp",
    "role",
    "admin_ukm_id",
    "admin_division_id",
    "admin_division_slug",
  ]),
);
