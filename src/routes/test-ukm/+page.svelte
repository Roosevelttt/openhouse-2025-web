<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "$lib/api";
  import { PUBLIC_API_BASE } from "$env/static/public";

  interface Ukm {
    id: string;
    name: string;
    slug: string;
    current_slot: number | null;
    max_slot: number | null;
    regist_fee: number | null;
    description: string;
    logo_url: string;
    poster_url: string | null;
    groupchat: string;
    image_urls: string | null;
    video_url: string | null;
    qris_url: string | null;
  }

  let ukms: Ukm[] = $state([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selectedUkm: Ukm | null = $state(null);

  // Helper function to get full image URL
  function getImageUrl(relativeUrl: string | null): string | null {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl; 
    return `${PUBLIC_API_BASE}${relativeUrl}`;
  }

  onMount(async () => {
    await fetchUkms();
  });

  async function fetchUkms() {
    try {
      loading = true;
      error = null;
      
      ukms = await get("/api/ukms");
    } catch (err: any) {
      error = "Failed to fetch UKMs";
      console.error("Error fetching UKMs:", err);
    } finally {
      loading = false;
    }
  }

  async function fetchUkmById(id: string) {
    try {
      selectedUkm = await get(`/api/ukms/${id}`);
    } catch (err: any) {
      error = "Failed to fetch UKM details";
      console.error("Error fetching UKM by ID:", err);
    }
  }

  async function fetchUkmBySlug(slug: string) {
    try {
      selectedUkm = await get(`/api/ukms/slug/${slug}`);
    } catch (err: any) {
      error = "Failed to fetch UKM by slug";
      console.error("Error fetching UKM by slug:", err);
    }
  }

  function parseImageUrls(imageUrls: string | null): string[] {
    if (!imageUrls) return [];
    try {
      return JSON.parse(imageUrls);
    } catch {
      return [];
    }
  }

  function formatFee(fee: number | null): string {
    if (fee === null || fee === 0) return "Free";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(fee);
  }
</script>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">UKM Information</h1>
      <p class="mt-2 text-gray-600">Browse and view details of available UKMs</p>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Loading State -->
    {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading UKMs...</span>
      </div>
    {:else}
      <!-- UKM -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {#each ukms as ukm}
          <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <!-- Logo -->
            {#if ukm.logo_url}
              <div class="h-48 bg-gray-200 flex items-center justify-center">
                <img 
                  src={getImageUrl(ukm.logo_url)} 
                  alt="{ukm.name} logo" 
                  class="max-h-full max-w-full object-contain"
                />
              </div>
            {:else}
              <div class="h-48 bg-gray-200 flex items-center justify-center">
                <span class="text-gray-500">No Logo</span>
              </div>
            {/if}

            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{ukm.name}</h3>
              <p class="text-sm text-gray-600 mb-3 line-clamp-2">{ukm.description}</p>
              
              <!-- Info -->
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span>Registration Fee:</span>
                  <span class="font-medium">{formatFee(ukm.regist_fee)}</span>
                </div>
                {#if ukm.current_slot !== null && ukm.max_slot !== null}
                  <div class="flex justify-between">
                    <span>Slots:</span>
                    <span class="font-medium">{ukm.current_slot}/{ukm.max_slot}</span>
                  </div>
                {/if}
              </div>

              <!-- Actions -->
              <div class="mt-4 space-y-2">
                <button 
                  onclick={() => fetchUkmById(ukm.id)}
                  class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details by ID
                </button>
                <button 
                  onclick={() => fetchUkmBySlug(ukm.slug)}
                  class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  View Details by Slug
                </button>
              </div>

              <!-- URLs Section -->
              <div class="mt-4 pt-4 border-t border-gray-200">
                <h4 class="text-sm font-medium text-gray-900 mb-2">URLs:</h4>
                <div class="space-y-1 text-xs">
                  <div class="break-all">
                    <span class="font-medium">Logo:</span> 
                    <span class="text-blue-600">{ukm.logo_url || 'N/A'}</span>
                  </div>
                  <div class="break-all">
                    <span class="font-medium">Poster:</span> 
                    <span class="text-blue-600">{ukm.poster_url || 'N/A'}</span>
                  </div>
                  <div class="break-all">
                    <span class="font-medium">Video:</span> 
                    <span class="text-blue-600">{ukm.video_url || 'N/A'}</span>
                  </div>
                  <div class="break-all">
                    <span class="font-medium">QRIS:</span> 
                    <span class="text-blue-600">{ukm.qris_url || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Selected UKM Details Modal -->
      {#if selectedUkm}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <!-- Header -->
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900">{selectedUkm.name}</h2>
                  <p class="text-gray-600">Slug: {selectedUkm.slug}</p>
                </div>
                <button 
                  onclick={() => selectedUkm = null}
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <!-- Logo -->
                  {#if selectedUkm.logo_url}
                    <div>
                      <h3 class="text-lg font-medium mb-2">Logo</h3>
                      <img 
                        src={getImageUrl(selectedUkm.logo_url)} 
                        alt="{selectedUkm.name} logo" 
                        class="w-full h-48 object-contain bg-gray-100 rounded-lg"
                      />
                      <p class="text-xs text-gray-600 mt-1 break-all">{selectedUkm.logo_url}</p>
                    </div>
                  {/if}

                  <!-- Poster -->
                  {#if selectedUkm.poster_url}
                    <div>
                      <h3 class="text-lg font-medium mb-2">Poster</h3>
                      <img 
                        src={getImageUrl(selectedUkm.poster_url)} 
                        alt="{selectedUkm.name} poster" 
                        class="w-full h-64 object-contain bg-gray-100 rounded-lg"
                      />
                      <p class="text-xs text-gray-600 mt-1 break-all">{selectedUkm.poster_url}</p>
                    </div>
                  {/if}

                  <!-- Images -->
                  {#if selectedUkm.image_urls}
                    {@const images = parseImageUrls(selectedUkm.image_urls)}
                    {#if images.length > 0}
                      <div>
                        <h3 class="text-lg font-medium mb-2">Gallery</h3>
                        <div class="grid grid-cols-2 gap-2">
                          {#each images as imageUrl}
                            <div>
                              <img 
                                src={getImageUrl(imageUrl)} 
                                alt="Gallery image" 
                                class="w-full h-32 object-cover bg-gray-100 rounded-lg"
                              />
                              <p class="text-xs text-gray-600 mt-1 break-all">{imageUrl}</p>
                            </div>
                          {/each}
                        </div>
                      </div>
                    {/if}
                  {/if}
                </div>

                <!-- Details -->
                <div class="space-y-4">
                  <div>
                    <h3 class="text-lg font-medium mb-2">Description</h3>
                    <p class="text-gray-700">{selectedUkm.description}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h4 class="font-medium text-gray-900">Registration Fee</h4>
                      <p class="text-gray-700">{formatFee(selectedUkm.regist_fee)}</p>
                    </div>
                    {#if selectedUkm.current_slot !== null && selectedUkm.max_slot !== null}
                      <div>
                        <h4 class="font-medium text-gray-900">Slots</h4>
                        <p class="text-gray-700">{selectedUkm.current_slot}/{selectedUkm.max_slot}</p>
                      </div>
                    {/if}
                  </div>

                  <!-- Video -->
                  {#if selectedUkm.video_url}
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">Video</h4>
                      <a 
                        href={selectedUkm.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {selectedUkm.video_url}
                      </a>
                    </div>
                  {/if}

                  <!-- Groupchat -->
                  {#if selectedUkm.groupchat}
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">Group Chat</h4>
                      <p class="text-gray-700 break-all">{selectedUkm.groupchat}</p>
                    </div>
                  {/if}

                  <!-- QRIS -->
                  {#if selectedUkm.qris_url}
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">QRIS URL</h4>
                      <p class="text-blue-600 break-all">{selectedUkm.qris_url}</p>
                    </div>
                  {/if}

                  <!-- URLs Summary -->
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2">All URLs</h4>
                    <div class="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                      <div><span class="font-medium">API ID:</span> /api/ukms/{selectedUkm.id}</div>
                      <div><span class="font-medium">API Slug:</span> /api/ukms/slug/{selectedUkm.slug}</div>
                      <div><span class="font-medium">Logo:</span> {selectedUkm.logo_url || 'N/A'}</div>
                      <div><span class="font-medium">Poster:</span> {selectedUkm.poster_url || 'N/A'}</div>
                      <div><span class="font-medium">Video:</span> {selectedUkm.video_url || 'N/A'}</div>
                      <div><span class="font-medium">QRIS:</span> {selectedUkm.qris_url || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>