export const prerender = false;
export const ssr = true;

import { getSessionValues } from "$lib/api";

// Fetch session values
async function session(keysArray: string[]) {
  try {
    const sessionValues = await getSessionValues(keysArray);
    return sessionValues;
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
})();