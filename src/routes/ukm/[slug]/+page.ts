import { get } from "$lib/api";

export async function load({ params }) {
  try {
    const ukm = await get(`/api/ukms/slug/${params.slug}`);
    return { ukm };
  } catch (err) {
    console.error("Failed to fetch UKM by slug:", err);
    return {
      ukm: null,
      error: "Failed to fetch UKM data"
    };
  }
}
