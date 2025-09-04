<script lang="ts">
  import { onMount } from "svelte";
  import { get, post, put, del } from "$lib/api";
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
  let success = $state<string | null>(null);
  let showCreateModal = $state(false);
  let editingUkm: Ukm | null = $state(null);

  // Helper function to get full image URL
  function getImageUrl(relativeUrl: string | null): string | null {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl; // Already full URL
    return `${PUBLIC_API_BASE}${relativeUrl}`;
  }

  // Form state
  let formData = $state({
    name: "",
    slug: "",
    current_slot: "",
    max_slot: "",
    regist_fee: "",
    description: "",
    groupchat: "",
    video_url: ""
  });

  let files = $state({
    logo: null as File | null,
    poster: null as File | null,
    images: [] as File[]
  });

  // Image management for editing
  let imagesToRemove = $state<string[]>([]);
  let existingImages = $state<string[]>([]);

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

  function openCreateModal() {
    resetForm();
    showCreateModal = true;
    editingUkm = null;
  }

  function openEditModal(ukm: Ukm) {
    resetForm();
    editingUkm = ukm;
    formData = {
      name: ukm.name,
      slug: ukm.slug,
      current_slot: ukm.current_slot?.toString() || "",
      max_slot: ukm.max_slot?.toString() || "",
      regist_fee: ukm.regist_fee?.toString() || "",
      description: ukm.description,
      groupchat: ukm.groupchat,
      video_url: ukm.video_url || ""
    };
    
    // Parse existing images
    existingImages = parseImageUrls(ukm.image_urls);
    imagesToRemove = [];
    
    showCreateModal = true;
  }

  function closeModal() {
    showCreateModal = false;
    editingUkm = null;
    resetForm();
  }

  function resetForm() {
    formData = {
      name: "",
      slug: "",
      current_slot: "",
      max_slot: "",
      regist_fee: "",
      description: "",
      groupchat: "",
      video_url: ""
    };
    files = {
      logo: null,
      poster: null,
      images: []
    };
    imagesToRemove = [];
    existingImages = [];
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    try {
      error = null;
      success = null;

      const formDataToSend = new FormData();
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      // Add images to remove (comma-separated)
      if (imagesToRemove.length > 0) {
        formDataToSend.append("remove_images", imagesToRemove.join(","));
      }

      // Add files
      if (files.logo) formDataToSend.append("logo", files.logo);
      if (files.poster) formDataToSend.append("poster", files.poster);
      files.images.forEach(file => formDataToSend.append("images", file));

      if (editingUkm) {
        await put(`/api/admin/ukms/${editingUkm.id}`, formDataToSend);
        success = "UKM updated successfully!";
      } else {
        await post("/api/admin/ukms", formDataToSend);
        success = "UKM created successfully!";
      }

      closeModal();
      await fetchUkms();
      setTimeout(() => success = null, 3000);
    } catch (err: any) {
      error = err.message || "Operation failed";
      console.error("Error submitting form:", err);
    }
  }

  async function deleteUkm(ukm: Ukm) {
    if (!confirm(`Are you sure you want to delete "${ukm.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      error = null;
      success = null;

      await del(`/api/admin/ukms/${ukm.id}`);
      
      success = "UKM deleted successfully!";
      await fetchUkms();
      setTimeout(() => success = null, 3000);
    } catch (err: any) {
      error = err.message || "Delete failed";
      console.error("Error deleting UKM:", err);
    }
  }

  function handleFileChange(event: Event, type: 'logo' | 'poster' | 'images') {
    const target = event.target as HTMLInputElement;
    const selectedFiles = target.files;
    
    if (!selectedFiles) return;

    if (type === 'images') {
      files.images = Array.from(selectedFiles);
    } else {
      files[type] = selectedFiles[0] || null;
    }
  }

  function addImageToRemove(imageUrl: string) {
    if (!imagesToRemove.includes(imageUrl)) {
      imagesToRemove = [...imagesToRemove, imageUrl];
    }
  }

  function removeImageFromRemoveList(imageUrl: string) {
    imagesToRemove = imagesToRemove.filter(url => url !== imageUrl);
  }

  function isImageMarkedForRemoval(imageUrl: string): boolean {
    return imagesToRemove.includes(imageUrl);
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
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">UKM Management</h1>
        <p class="mt-2 text-gray-600">Manage UKM information, images, and details</p>
      </div>
      <button 
        onclick={openCreateModal}
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Create New UKM
      </button>
    </div>

    <!-- Success Message -->
    {#if success}
      <div class="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">Success</h3>
            <div class="mt-2 text-sm text-green-700">{success}</div>
          </div>
        </div>
      </div>
    {/if}

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
      <!-- UKM Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each ukms as ukm}
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
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
              <div class="space-y-2 text-sm text-gray-600 mb-4">
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
                <div class="flex justify-between">
                  <span>Slug:</span>
                  <span class="font-medium text-blue-600">{ukm.slug}</span>
                </div>
              </div>

              <!-- Media Preview -->
              <div class="mb-4">
                <h4 class="text-sm font-medium text-gray-900 mb-2">Media:</h4>
                <div class="flex space-x-2 text-xs">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {ukm.logo_url ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    Logo: {ukm.logo_url ? '✓' : '✗'}
                  </span>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {ukm.poster_url ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    Poster: {ukm.poster_url ? '✓' : '✗'}
                  </span>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {ukm.video_url ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    Video: {ukm.video_url ? '✓' : '✗'}
                  </span>
                </div>
                {#if ukm.image_urls}
                  {@const images = parseImageUrls(ukm.image_urls)}
                  <div class="mt-1">
                    <span class="text-xs text-gray-600">Gallery: {images.length} images</span>
                  </div>
                {/if}
              </div>

              <!-- Actions -->
              <div class="flex space-x-2">
                <button 
                  onclick={() => openEditModal(ukm)}
                  class="flex-1 bg-yellow-600 text-white px-3 py-2 text-sm rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onclick={() => deleteUkm(ukm)}
                  class="flex-1 bg-red-600 text-white px-3 py-2 text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Create/Edit Modal -->
    {#if showCreateModal}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">
                {editingUkm ? 'Edit UKM' : 'Create New UKM'}
              </h2>
              <button 
                onclick={closeModal}
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form onsubmit={handleSubmit} class="space-y-6">
              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    UKM Name *
                  </label>
                  <input 
                    type="text" 
                    id="name"
                    bind:value={formData.name}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="slug" class="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input 
                    type="text" 
                    id="slug"
                    bind:value={formData.slug}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="current_slot" class="block text-sm font-medium text-gray-700 mb-2">
                    Current Slot
                  </label>
                  <input 
                    type="number" 
                    id="current_slot"
                    bind:value={formData.current_slot}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="max_slot" class="block text-sm font-medium text-gray-700 mb-2">
                    Max Slot
                  </label>
                  <input 
                    type="number" 
                    id="max_slot"
                    bind:value={formData.max_slot}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="regist_fee" class="block text-sm font-medium text-gray-700 mb-2">
                    Registration Fee
                  </label>
                  <input 
                    type="number" 
                    id="regist_fee"
                    bind:value={formData.regist_fee}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="groupchat" class="block text-sm font-medium text-gray-700 mb-2">
                    Group Chat Link
                  </label>
                  <input 
                    type="text" 
                    id="groupchat"
                    bind:value={formData.groupchat}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea 
                  id="description"
                  bind:value={formData.description}
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <!-- Video URL -->
              <div>
                <label for="video_url" class="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URL
                </label>
                <input 
                  type="url" 
                  id="video_url"
                  bind:value={formData.video_url}
                  placeholder="https://www.youtube.com/watch?v=..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- File Uploads -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label for="logo" class="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <input 
                    type="file" 
                    id="logo"
                    accept="image/*"
                    onchange={(e) => handleFileChange(e, 'logo')}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="poster" class="block text-sm font-medium text-gray-700 mb-2">
                    Poster
                  </label>
                  <input 
                    type="file" 
                    id="poster"
                    accept="image/*"
                    onchange={(e) => handleFileChange(e, 'poster')}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="images" class="block text-sm font-medium text-gray-700 mb-2">
                    Gallery Images
                  </label>
                  <input 
                    type="file" 
                    id="images"
                    accept="image/*"
                    multiple
                    onchange={(e) => handleFileChange(e, 'images')}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Existing Images Management (for edit only) -->
              {#if editingUkm && existingImages.length > 0}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    Existing Gallery Images
                  </label>
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {#each existingImages as imageUrl}
                      <div class="relative group">
                        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={getImageUrl(imageUrl)} 
                            alt="Gallery image" 
                            class="w-full h-full object-cover {isImageMarkedForRemoval(imageUrl) ? 'opacity-50 grayscale' : ''}"
                          />
                        </div>
                        
                        <div class="absolute top-2 right-2">
                          {#if isImageMarkedForRemoval(imageUrl)}
                            <button
                              type="button"
                              onclick={() => removeImageFromRemoveList(imageUrl)}
                              class="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full shadow-lg transition-colors"
                              title="Keep this image"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </button>
                          {:else}
                            <button
                              type="button"
                              onclick={() => addImageToRemove(imageUrl)}
                              class="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
                              title="Remove this image"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          {/if}
                        </div>
                        
                        {#if isImageMarkedForRemoval(imageUrl)}
                          <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                            <span class="text-white text-sm font-medium">Will be removed</span>
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                  
                  {#if imagesToRemove.length > 0}
                    <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p class="text-sm text-red-700">
                        <span class="font-medium">{imagesToRemove.length}</span> 
                        {imagesToRemove.length === 1 ? 'image' : 'images'} will be removed when you save.
                      </p>
                    </div>
                  {/if}
                </div>
              {/if}

              <!-- Actions -->
              <div class="flex justify-end space-x-4">
                <button 
                  type="button"
                  onclick={closeModal}
                  class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingUkm ? 'Update UKM' : 'Create UKM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>