import { INTERNAL_API_URL } from "$env/static/private";
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  try {
    const sessionResponse = await fetch(`${INTERNAL_API_URL}/api/debug/session`, {
      headers: {
        'Cookie': cookies.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
      }
    });

    if (!sessionResponse.ok) {
      return {
        session: null
      };
    }

    const sessionData = await sessionResponse.json();
    const { debug_session } = sessionData;

    return {
      session: {
        nrp: debug_session.nrp,
        role: debug_session.role,
        name: debug_session.name,
        admin_ukm_id: debug_session.admin_ukm_id,
        admin_ukm_name: debug_session.admin_ukm_name || null,
        admin_division_id: debug_session.admin_division_id,
        admin_division_slug: debug_session.admin_division_slug || null
      }
    };
  } catch (error) {
    console.error('Session fetch exception:', error);
    return {
      session: null
    };
  }
};