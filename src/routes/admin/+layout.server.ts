import { redirect } from '@sveltejs/kit';
import { INTERNAL_API_URL } from '$env/static/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  try {
    // Check session
    const sessionResponse = await fetch(`${INTERNAL_API_URL}/api/debug/session`, {
      headers: {
        'Cookie': cookies.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
      }
    });

    if (!sessionResponse.ok) {
      throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
    }

    const sessionData = await sessionResponse.json();
    const { debug_session } = sessionData;

    // Check if user has admin role
    if (debug_session.role !== 'admin') {
      throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}&error=admin_required`);
    }

    // Return admin context
    return {
      admin: {
        nrp: debug_session.nrp,
        name: debug_session.admin_name,
        ukmId: debug_session.admin_ukm_id,
        divisionId: debug_session.admin_division_id,
        role: debug_session.role
      }
    };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}&error=session_error`);
  }
};