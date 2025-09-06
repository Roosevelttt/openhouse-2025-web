<script lang="ts">
  import { onMount } from "svelte";
  import { get, post, put, del } from "$lib/api";
  import { PUBLIC_API_BASE } from "$env/static/public";
  import Dropdown from "$lib/components/admin/Dropdown.svelte";

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

  // Search and filter state
  let searchTerm = $state("");
  let filterStatus = $state<"all" | "active" | "full" | "no_slots">("all");
  let sortBy = $state<"name" | "created" | "fee" | "slots">("name");
  let sortDirection = $state<"asc" | "desc">("asc");

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

  onMount(() => {
    fetchUkms();
  });

  async function fetchUkms() {
    loading = true;
    error = null;
    
    console.log("Fetching UKMs...");
    console.log("API Base URL:", PUBLIC_API_BASE);
    console.log("Full request URL:", `${PUBLIC_API_BASE}/api/ukms`);
    
    // Add timeout protection
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Fetch operation taking longer than expected...");
      }
    }, 5000);
    
    try {
      const result = await get<Ukm[]>("/api/ukms");
      clearTimeout(timeoutId);
      ukms = result;
      console.log("UKMs fetched successfully:", ukms);
      console.log("Number of UKMs:", ukms.length);
    } catch (err: any) {
      clearTimeout(timeoutId);
      error = "Failed to fetch UKMs";
      console.error("Error fetching UKMs:", err);
      console.error("Error details:", err.message, err.status);
      ukms = [];
    }
    
    loading = false;
    console.log("Loading state set to false");
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

  // Filter and sort options
  const statusOptions = [
    { value: "all", label: "All UKMs" },
    { value: "active", label: "Active" },
    { value: "full", label: "Full" },
    { value: "no_slots", label: "No Slots Set" }
  ];

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "fee", label: "Registration Fee" },
    { value: "slots", label: "Available Slots" }
  ];

  // Filtered and sorted UKMs
  let filteredAndSortedUkms = $derived.by(() => {
    let filtered: Ukm[] = ukms;

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(ukm => 
        ukm.name.toLowerCase().includes(lowerSearch) ||
        ukm.slug.toLowerCase().includes(lowerSearch) ||
        ukm.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(ukm => {
        switch (filterStatus) {
          case "active":
            return ukm.max_slot && ukm.current_slot !== null && ukm.current_slot < ukm.max_slot;
          case "full":
            return ukm.max_slot && ukm.current_slot !== null && ukm.current_slot >= ukm.max_slot;
          case "no_slots":
            return !ukm.max_slot || ukm.current_slot === null;
          default:
            return true;
        }
      });
    }

    // Apply sorting - create a copy first to avoid mutation
    const sorted: Ukm[] = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "fee":
          const feeA = a.regist_fee || 0;
          const feeB = b.regist_fee || 0;
          comparison = feeA - feeB;
          break;
        case "slots":
          const slotsA = a.max_slot ? (a.max_slot - (a.current_slot || 0)) : -1;
          const slotsB = b.max_slot ? (b.max_slot - (b.current_slot || 0)) : -1;
          comparison = slotsA - slotsB;
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  });

  function getUkmStatus(ukm: Ukm): { label: string; class: string } {
    if (!ukm.max_slot || ukm.current_slot === null) {
      return { label: "No Slots", class: "admin-status-badge admin-status-pending" };
    }
    
    if (ukm.current_slot >= ukm.max_slot) {
      return { label: "Full", class: "admin-status-badge admin-status-error" };
    }
    
    return { label: "Active", class: "admin-status-badge admin-status-success" };
  }
</script>

<svelte:head>
  <title>OH Admin | UKM Management</title>
</svelte:head>

<main class="admin-card">
  <div class="admin-card-header mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div class="admin-card-title">
      <h2 class="text-lg font-semibold text-admin-text-primary mb-1">
        UKM Management
      </h2>
      <p class="text-sm text-admin-text-secondary">
        Manage UKM information, images, and details
      </p>
    </div>
    <div>
      <button 
        onclick={openCreateModal}
        class="admin-btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Create New UKM
      </button>
    </div>
  </div>

  <div class="admin-filters-section mb-6">
    <div class="flex flex-wrap gap-4 items-end w-full">
      <!-- Search -->
      <div class="admin-filter-group flex-1 min-w-full md:min-w-64">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="admin-form-label">Search UKMs</label>
        <div class="relative">
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4 text-admin-text-tertiary"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <input
            class="admin-form-input pl-10 pr-4 w-full"
            type="text"
            bind:value={searchTerm}
            placeholder="Search by name, slug, or description..."
          />
        </div>
      </div>

      <!-- Status Filter -->
      <div class="admin-filter-group w-full sm:w-auto">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="admin-form-label">Status</label>
        <Dropdown
          options={statusOptions}
          bind:value={filterStatus}
          size="md"
          class="w-full sm:w-40"
        />
      </div>

      <!-- Sort By -->
      <div class="admin-filter-group w-full sm:w-auto">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="admin-form-label">Sort By</label>
        <div class="flex gap-1 w-full">
          <Dropdown
            options={sortOptions}
            bind:value={sortBy}
            size="md"
            class="flex-1 min-w-0"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    <div class="text-sm text-admin-text-secondary">
      Showing <span class="font-medium text-admin-text-primary">{filteredAndSortedUkms.length}</span> of <span class="font-medium text-admin-text-primary">{ukms.length}</span> UKMs
      {#if searchTerm || filterStatus !== 'all'}
        <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-admin-background text-admin-text-secondary">
          Filtered
        </span>
      {/if}
    </div>
    
    {#if searchTerm || filterStatus !== 'all'}
      <button
        onclick={() => { searchTerm = ''; filterStatus = 'all'; }}
        class="text-sm text-admin-text-secondary hover:text-admin-text-primary transition-colors w-fit"
      >
        Clear filters
      </button>
    {/if}
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="flex justify-center items-center py-8 sm:py-12">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-admin-text-secondary sm:h-8 sm:w-8"></div>
      <span class="ml-2 text-admin-text-secondary text-sm sm:ml-3 sm:text-base">Loading UKMs...</span>
    </div>
  {:else if filteredAndSortedUkms.length === 0}
    <!-- Empty State -->
    <div class="text-center py-8 sm:py-12">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-admin-text-tertiary mx-auto mb-3 sm:w-12 sm:h-12 sm:mb-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
      <h3 class="text-base font-medium text-admin-text-primary mb-2 sm:text-lg sm:mb-2">
        {searchTerm || filterStatus !== 'all' ? 'No UKMs match your filters' : 'No UKMs found'}
      </h3>
      <p class="text-admin-text-secondary mb-4 text-sm sm:text-base">
        {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by creating your first UKM.'}
      </p>
      {#if !searchTerm && filterStatus === 'all'}
        <button onclick={openCreateModal} class="admin-btn-primary w-full sm:w-auto">
          Create New UKM
        </button>
      {/if}
    </div>
  {:else}
    <!-- List View -->
    <div class="border border-admin-border rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-admin-background">
              <th class="admin-table-header text-left">UKM</th>
              <th class="admin-table-header text-left">Status</th>
              <th class="admin-table-header text-left">Fee</th>
              <th class="admin-table-header text-left">Slots</th>
              <th class="admin-table-header text-left">Media</th>
              <th class="admin-table-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-admin-card-bg">
            {#each filteredAndSortedUkms as ukm}
              {@const status = getUkmStatus(ukm)}
              <tr class="admin-table-row border-b border-admin-border hover:bg-admin-hover transition-colors">
                <td class="admin-table-cell">
                  <div class="flex items-center space-x-3">
                    {#if ukm.logo_url}
                      <div class="w-10 h-10 bg-admin-background rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={getImageUrl(ukm.logo_url)} alt="{ukm.name} logo" class="w-full h-full object-cover" />
                      </div>
                    {:else}
                      <div class="w-10 h-10 bg-admin-background rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-admin-text-tertiary">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
                        </svg>
                      </div>
                    {/if}
                    <div>
                      <div class="font-medium text-admin-text-primary truncate max-w-[120px]">{ukm.name}</div>
                      <div class="text-sm text-admin-text-tertiary truncate max-w-[120px]">{ukm.slug}</div>
                    </div>
                  </div>
                </td>
                <td class="admin-table-cell">
                  <span class="{status.class}">{status.label}</span>
                </td>
                <td class="admin-table-cell">
                  <span class="font-medium">{formatFee(ukm.regist_fee)}</span>
                </td>
                <td class="admin-table-cell">
                  {#if ukm.max_slot && ukm.current_slot !== null}
                    <span class="font-medium">{ukm.current_slot}/{ukm.max_slot}</span>
                    <div class="w-full bg-admin-background rounded-full h-1.5 mt-1">
                      <div class="bg-admin-text-primary h-1.5 rounded-full" style="width: {(ukm.current_slot / ukm.max_slot) * 100}%"></div>
                    </div>
                  {:else}
                    <span class="text-admin-text-tertiary">No slots set</span>
                  {/if}
                </td>
                <td class="admin-table-cell">
                  <div class="flex space-x-1">
                    <span class="w-2 h-2 rounded-full {ukm.logo_url ? 'bg-admin-success' : 'bg-admin-background'}"></span>
                    <span class="w-2 h-2 rounded-full {ukm.poster_url ? 'bg-admin-success' : 'bg-admin-background'}"></span>
                    <span class="w-2 h-2 rounded-full {ukm.video_url ? 'bg-admin-success' : 'bg-admin-background'}"></span>
                    {#if ukm.image_urls}
                      {@const images = parseImageUrls(ukm.image_urls)}
                      <span class="w-2 h-2 rounded-full {images.length > 0 ? 'bg-admin-success' : 'bg-admin-background'}"></span>
                    {/if}
                  </div>
                </td>
                <td class="admin-table-cell">
                  <div class="flex space-x-2 justify-center">
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button 
                      onclick={() => openEditModal(ukm)}
                      class="admin-action-btn admin-action-btn-secondary p-2"
                      title="Edit UKM"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button 
                      onclick={() => deleteUkm(ukm)}
                      class="admin-action-btn admin-action-btn-error p-2"
                      title="Delete UKM"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Create/Edit Modal -->
  {#if showCreateModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50" onclick={(e) => e.target === e.currentTarget && closeModal()}>
      <div class="admin-card rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="bg-admin-background px-6 py-4 border-b border-admin-border sm:px-8 sm:py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3 sm:space-x-4">
              <div class="p-2 bg-admin-text-primary/10 rounded-lg sm:p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-admin-text-primary sm:w-5 sm:h-5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-3-3m1-4a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-lg font-bold text-admin-text-primary sm:text-2xl">
                  {editingUkm ? 'Edit UKM/LK-KBM' : 'Create New UKM/LK-KBM'}
                </h1>
              </div>
            </div>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button 
              onclick={closeModal}
              class="p-2 rounded-lg text-admin-text-tertiary hover:text-admin-text-primary hover:bg-admin-hover transition-all duration-200 sm:p-2.5"
              title="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-5 sm:h-5">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="flex flex-col h-[calc(90vh-100px)] sm:h-[calc(90vh-140px)]">
          <!-- Main Content Area -->
          <div class="flex-1 overflow-y-auto">
            <form onsubmit={handleSubmit} class="h-full">
              <div class="p-4 sm:p-8">
                <!-- Section 1: Basic Information -->
                <div class="admin-card rounded-lg p-4 border border-admin-border sm:p-6">
                  <div class="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div class="p-2 bg-admin-text-primary/10 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-admin-text-primary">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                    </div>
                    <div>
                      <h2 class="text-lg font-semibold text-admin-text-primary">Basic Information</h2>
                      <p class="text-xs text-admin-text-secondary sm:text-sm">Essential details about the student UKM/LK-KBM</p>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 gap-4 sm:gap-6">
                    <!-- Left Column -->
                    <div class="space-y-4">
                      <div class="space-y-2">
                        <label for="name" class="block text-sm font-semibold text-admin-text-primary">
                          UKM/LK-KBM Name
                          <span class="text-red-500 ml-1">*</span>
                        </label>
                        <input 
                          type="text" 
                          id="name"
                          bind:value={formData.name}
                          required
                          class="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary"
                          placeholder="Enter the full UKM/LK-KBM name"
                        />
                        <p class="text-xs text-admin-text-tertiary">Official name of the student UKM/LK-KBM</p>
                      </div>

                      <div class="space-y-2">
                        <label for="slug" class="block text-sm font-semibold text-admin-text-primary">
                          URL Slug
                          <span class="text-red-500 ml-1">*</span>
                        </label>
                        <input 
                          type="text" 
                          id="slug"
                          bind:value={formData.slug}
                          required
                          class="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary"
                          placeholder="url-friendly-name"
                        />
                        <p class="text-xs text-admin-text-tertiary">Used in URLs, should be lowercase with hyphens</p>
                      </div>

                      <div class="space-y-2">
                        <label for="regist_fee" class="block text-sm font-semibold text-admin-text-primary">
                          Registration Fee
                        </label>
                        <div class="relative">
                          <span class="absolute left-3 top-2.5 text-admin-text-tertiary text-sm">IDR</span>
                          <input 
                            type="number" 
                            id="regist_fee"
                            bind:value={formData.regist_fee}
                            class="w-full pl-12 pr-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <p class="text-xs text-admin-text-tertiary">Leave as 0 for free registration</p>
                      </div>
                    </div>

                    <!-- Right Column -->
                    <div class="space-y-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="space-y-2">
                          <label for="current_slot" class="block text-sm font-semibold text-admin-text-primary">
                            Current Members
                          </label>
                          <input 
                            type="number" 
                            id="current_slot"
                            bind:value={formData.current_slot}
                            class="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary"
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div class="space-y-2">
                          <label for="max_slot" class="block text-sm font-semibold text-admin-text-primary">
                            Maximum Capacity
                          </label>
                          <input 
                            type="number" 
                            id="max_slot"
                            bind:value={formData.max_slot}
                            class="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary"
                            placeholder="100"
                            min="1"
                          />
                        </div>
                      </div>

                      <div class="space-y-2">
                        <label for="groupchat" class="block text-sm font-semibold text-admin-text-primary">
                          Group Chat Link
                        </label>
                        <input 
                          type="url" 
                          id="groupchat"
                          bind:value={formData.groupchat}
                          class="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary"
                          placeholder="https://chat.whatsapp.com/..."
                        />
                        <p class="text-xs text-admin-text-tertiary">WhatsApp or Telegram group invitation link</p>
                      </div>

                      <!-- Capacity Progress -->
                      {#if formData.max_slot && formData.current_slot}
                        <div class="p-4 bg-admin-background rounded-lg border border-admin-border">
                          <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-semibold text-admin-text-primary">Capacity Status</span>
                            <span class="text-sm text-admin-text-secondary">{formData.current_slot}/{formData.max_slot}</span>
                          </div>
                          <div class="w-full bg-admin-border rounded-full h-2 overflow-hidden">
                            <div 
                              class="bg-admin-text-primary h-2 rounded-full transition-all duration-300"
                              style="width: {Math.min((parseInt(formData.current_slot) / parseInt(formData.max_slot)) * 100, 100)}%"
                            ></div>
                          </div>
                          <p class="text-xs text-admin-text-tertiary mt-1">
                            {Math.round((parseInt(formData.current_slot) / parseInt(formData.max_slot)) * 100)}% capacity filled
                          </p>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>

                <!-- Section 2: Description & Media -->
                <div class="admin-card rounded-lg p-4 border border-admin-border sm:p-6">
                  <div class="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div class="p-2 bg-admin-text-primary/10 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-admin-text-primary">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <div>
                      <h2 class="text-lg font-semibold text-admin-text-primary">Description</h2>
                    </div>
                  </div>

                  <div class="space-y-4 sm:space-y-6">
                    <div class="space-y-2 sm:space-y-3">
                      <label for="description" class="block text-sm font-semibold text-admin-text-primary">
                        UKM/LK-KBM Description
                      </label>
                      <textarea 
                        id="description"
                        bind:value={formData.description}
                        rows="6"
                        class="w-full px-3 py-3 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary resize-none"
                        placeholder="Describe the UKM/LK-KBM's mission, activities, achievements, and what makes it unique. This will be displayed to prospective members and should inspire them to join your community."
                      ></textarea>
                      <p class="text-xs text-admin-text-tertiary">Provide a comprehensive overview that will attract potential members</p>
                    </div>

                    <div class="space-y-2 sm:space-y-3">
                      <label for="video_url" class="block text-sm font-semibold text-admin-text-primary">
                        Promotional Video
                      </label>
                      <div class="relative">
                        <div class="absolute left-3 top-3 text-admin-text-tertiary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                        </div>
                        <input 
                          type="url" 
                          id="video_url"
                          bind:value={formData.video_url}
                          placeholder="https://www.youtube.com/watch?v=..."
                          class="w-full pl-11 pr-3 py-3 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary"
                        />
                      </div>
                      <p class="text-xs text-admin-text-tertiary">YouTube video showcasing the UKM/LK-KBM (optional)</p>
                    </div>
                  </div>
                </div>

                <!-- Section 3: Files & Gallery -->
                <div class="admin-card rounded-lg p-4 border border-admin-border sm:p-6">
                  <div class="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div class="p-2 bg-admin-text-primary/10 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-admin-text-primary">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    </div>
                    <div>
                      <h2 class="text-lg font-semibold text-admin-text-primary">Files & Gallery</h2>
                      <p class="text-xs text-admin-text-secondary sm:text-sm">Upload images and media for the UKM/LK-KBM</p>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 gap-4 sm:gap-6">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <!-- Logo Upload -->
                      <div class="space-y-4 flex flex-col">
                        <div class="text-center flex-grow">
                          <div class="mx-auto w-16 h-16 bg-admin-background border-2 border-dashed border-admin-border rounded-lg flex items-center justify-center mb-3 hover:border-admin-text-primary/30 transition-colors sm:w-20 sm:h-20 sm:mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-admin-text-tertiary sm:w-5 sm:h-5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="17,8 12,3 7,8"/>
                              <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                          </div>
                          <h3 class="font-semibold text-admin-text-primary mb-1 text-sm sm:mb-2 sm:text-base">UKM/LK-KBM Logo</h3>
                          <div class="space-y-1">
                            <p class="text-xs text-admin-text-secondary sm:text-sm">Square format recommended</p>
                            <p class="text-xs text-admin-text-tertiary">PNG or JPG • Max 5MB</p>
                          </div>
                        </div>
                        <input 
                          type="file" 
                          id="logo"
                          accept="image/*"
                          onchange={(e) => handleFileChange(e, 'logo')}
                          class="w-full px-2 py-1.5 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-admin-text-primary file:text-white hover:file:bg-admin-text-primary/90 sm:px-3 sm:py-2 sm:file:mr-3 sm:file:py-1 sm:file:px-3 sm:file:text-sm"
                        />
                      </div>

                      <!-- Poster Upload -->
                      <div class="space-y-4 flex flex-col">
                        <div class="text-center flex-grow">
                          <div class="mx-auto w-16 h-16 bg-admin-background border-2 border-dashed border-admin-border rounded-lg flex items-center justify-center mb-3 hover:border-admin-text-primary/30 transition-colors sm:w-20 sm:h-20 sm:mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-admin-text-tertiary sm:w-5 sm:h-5">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="9" cy="9" r="2"/>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                          </div>
                          <h3 class="font-semibold text-admin-text-primary mb-1 text-sm sm:mb-2 sm:text-base">Event Poster</h3>
                          <div class="space-y-1">
                            <p class="text-xs text-admin-text-secondary sm:text-sm">Portrait format recommended</p>
                            <p class="text-xs text-admin-text-tertiary">PNG or JPG • Max 10MB</p>
                          </div>
                        </div>
                        <input 
                          type="file" 
                          id="poster"
                          accept="image/*"
                          onchange={(e) => handleFileChange(e, 'poster')}
                          class="w-full px-2 py-1.5 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-admin-text-primary file:text-white hover:file:bg-admin-text-primary/90 sm:px-3 sm:py-2 sm:file:mr-3 sm:file:py-1 sm:file:px-3 sm:file:text-sm"
                        />
                      </div>

                      <!-- Gallery Upload -->
                      <div class="space-y-4 flex flex-col">
                        <div class="text-center flex-grow">
                          <div class="mx-auto w-16 h-16 bg-admin-background border-2 border-dashed border-admin-border rounded-lg flex items-center justify-center mb-3 hover:border-admin-text-primary/30 transition-colors sm:w-20 sm:h-20 sm:mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-admin-text-tertiary sm:w-5 sm:h-5">
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="9" cy="9" r="2"/>
                            </svg>
                          </div>
                          <h3 class="font-semibold text-admin-text-primary mb-1 text-sm sm:mb-2 sm:text-base">Gallery Images</h3>
                          <div class="space-y-1">
                            <p class="text-xs text-admin-text-secondary sm:text-sm">Multiple images allowed</p>
                            <p class="text-xs text-admin-text-tertiary">PNG or JPG • Max 5MB each</p>
                          </div>
                        </div>
                        <input 
                          type="file" 
                          id="images"
                          accept="image/*"
                          multiple
                          onchange={(e) => handleFileChange(e, 'images')}
                          class="w-full px-2 py-1.5 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-admin-text-primary file:text-white hover:file:bg-admin-text-primary/90 sm:px-3 sm:py-2 sm:file:mr-3 sm:file:py-1 sm:file:px-3 sm:file:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Section 4: Existing Images Management (for edit only) -->
                {#if editingUkm && existingImages.length > 0}
                  <div class="admin-card rounded-lg p-4 border border-admin-border sm:p-6">
                    <div class="flex items-center space-x-3 mb-4 sm:mb-6">
                      <div class="p-2 bg-admin-text-primary/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-admin-text-primary">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </div>
                      <div>
                        <h2 class="text-lg font-semibold text-admin-text-primary">Manage Existing Images</h2>
                        <p class="text-xs text-admin-text-secondary sm:text-sm">Remove or keep current gallery images</p>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                      {#each existingImages as imageUrl}
                        <div class="relative group">
                          <div class="aspect-square bg-admin-background rounded-lg overflow-hidden border-2 transition-all duration-300 {isImageMarkedForRemoval(imageUrl) ? 'border-red-400' : 'border-admin-border hover:border-admin-text-primary/30'}">
                            <!-- svelte-ignore a11y_img_redundant_alt -->
                            <img 
                              src={getImageUrl(imageUrl)} 
                              alt="Gallery image" 
                              class="w-full h-full object-cover transition-all duration-300 {isImageMarkedForRemoval(imageUrl) ? 'opacity-30 grayscale scale-95' : 'hover:scale-105'}"
                            />
                          </div>
                          
                          <div class="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2">
                            {#if isImageMarkedForRemoval(imageUrl)}
                              <!-- svelte-ignore a11y_consider_explicit_label -->
                              <button
                                type="button"
                                onclick={() => removeImageFromRemoveList(imageUrl)}
                                class="bg-admin-success hover:bg-green-600 text-white p-1.5 rounded-full shadow-lg transition-all transform hover:scale-110 sm:p-2"
                                title="Keep this image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="sm:w-3 sm:h-3">
                                  <polyline points="20,6 9,17 4,12"/>
                                </svg>
                              </button>
                            {:else}
                              <!-- svelte-ignore a11y_consider_explicit_label -->
                              <button
                                type="button"
                                onclick={() => addImageToRemove(imageUrl)}
                                class="bg-admin-error hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-all transform hover:scale-110 sm:p-2"
                                title="Remove this image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="sm:w-3 sm:h-3">
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            {/if}
                          </div>
                          
                          {#if isImageMarkedForRemoval(imageUrl)}
                            <div class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                              <div class="bg-red-500 text-white px-1.5 py-1 rounded text-[10px] font-semibold sm:px-2 sm:py-1 sm:text-xs">
                                WILL BE REMOVED
                              </div>
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                    
                    {#if imagesToRemove.length > 0}
                      <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg sm:mt-6 sm:p-4">
                        <div class="flex items-start gap-2 sm:gap-3">
                          <div class="p-1 bg-red-500 rounded sm:p-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white sm:w-4 sm:h-4">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                              <line x1="12" y1="9" x2="12" y2="13"/>
                              <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                          </div>
                          <div>
                            <h4 class="font-semibold text-red-800 mb-1 text-sm sm:text-base">Pending Deletions</h4>
                            <p class="text-red-700 text-xs sm:text-sm">
                              <span class="font-semibold">{imagesToRemove.length}</span> 
                              {imagesToRemove.length === 1 ? 'image' : 'images'} will be permanently removed when you save.
                            </p>
                            <p class="text-red-600 text-[10px] mt-1 sm:text-xs">This action cannot be undone.</p>
                          </div>
                        </div>
                      </div>
                    {/if}
                  </div>
                {/if}

              </div>
              
              <!-- Form Actions Footer -->
              <div class="border-t border-admin-border bg-admin-background px-4 py-4 sm:px-8 sm:py-6">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div class="text-sm text-admin-text-secondary">
                    <span class="font-medium">All fields marked with</span> <span class="text-red-500 font-bold">*</span> <span class="font-medium">are required</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <button 
                      type="button"
                      onclick={closeModal}
                      class="px-4 py-2 border border-admin-border text-admin-text-primary font-semibold rounded-lg hover:bg-admin-hover transition-all duration-200 focus:ring-2 focus:ring-admin-text-primary/20 text-sm sm:px-5 sm:py-2.5"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      class="px-4 py-2 bg-admin-text-primary text-white font-semibold rounded-lg hover:bg-admin-text-primary/90 transition-all duration-200 focus:ring-2 focus:ring-admin-text-primary/30 flex items-center gap-2 text-sm sm:px-6 sm:py-2.5"
                    >
                      {#if editingUkm}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                        Update UKM/LK-KBM
                      {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Create UKM/LK-KBM
                      {/if}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>