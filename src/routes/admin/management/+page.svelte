<script lang="ts">
  import { onMount } from "svelte";
  import { get, post, put, del } from "$lib/api";
  import Swal from "sweetalert2";
  import Dropdown from "$lib/components/admin/Dropdown.svelte";
  import { getSessionValues } from "$lib/api";

  interface Admin {
    id: string;
    name: string;
    nrp: string;
    field: string;
    division_id: string | null;
    division_name: string | null;
    ukm_id: string | null;
    ukm_name: string | null;
    created_at: string;
  }

  interface Division {
    id: string;
    name: string;
    slug: string;
  }

  interface Ukm {
    id: string;
    name: string;
    slug: string;
  }

  // Check if user has access to this page
  let adminData: Record<string, any> = $state({});
  let hasAccess = $state(true);
  let accessChecked = $state(false);
  
  onMount(async () => {
    try {
      adminData = await getSessionValues([
        "admin_division_slug",
      ]);
      
      // it only
      if (adminData.admin_division_slug !== "it") {
        hasAccess = false;
      }
      accessChecked = true;
    } catch (e: any) {
      hasAccess = false;
      accessChecked = true;
    }
  });

  let admins: Admin[] = $state([]);
  let divisions: Division[] = $state([]);
  let ukms: Ukm[] = $state([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  let showCreateModal = $state(false);
  let editingAdmin: Admin | null = $state(null);

  onMount(() => {
    if (hasAccess) {
      fetchAdmins();
      fetchDivisions();
      fetchUkms();
    }
  });

  async function fetchAdmins() {
    loading = true;
    error = null;
    
    try {
      admins = await get<Admin[]>("/api/admins");
    } catch (err: any) {
      error = "Failed to fetch admins";
      console.error("Error fetching admins:", err);
    }
    
    loading = false;
  }

  async function fetchDivisions() {
    try {
      divisions = await get<Division[]>("/api/divisions");
    } catch (err: any) {
      console.error("Error fetching divisions:", err);
    }
  }

  async function fetchUkms() {
    try {
      ukms = await get<Ukm[]>("/api/ukms");
    } catch (err: any) {
      console.error("Error fetching UKMs:", err);
    }
  }

  function openCreateModal() {
    resetForm();
    showCreateModal = true;
    editingAdmin = null;
  }

  function openEditModal(admin: Admin) {
	resetForm();
	editingAdmin = admin;
	formData = {
		name: admin.name,
		nrp: admin.nrp,
		field: admin.field,
		division_id: admin.division_id || "",
		ukm_id: admin.ukm_id || ""
	};
	
	showCreateModal = true;
  }

  function closeModal() {
    showCreateModal = false;
    editingAdmin = null;
    resetForm();
  }

  function resetForm() {
    formData = {
      name: "",
      nrp: "",
      field: "",
      division_id: "",
      ukm_id: ""
    };
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    try {
      error = null;
      success = null;

      if (editingAdmin) {
        await put(`/api/admins/${editingAdmin.id}`, formData);
        success = "Admin updated successfully!";
      } else {
        await post("/api/admins", formData);
        success = "Admin created successfully!";
      }

      closeModal();
      await fetchAdmins();
      setTimeout(() => success = null, 3000);
    } catch (err: any) {
      error = err.message || "Operation failed";
      console.error("Error submitting form:", err);
    }
  }

  async function deleteAdmin(admin: Admin) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete admin "${admin.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      error = null;
      success = null;

      await del(`/api/admins/${admin.id}`);
      
      success = "Admin deleted successfully!";
      await fetchAdmins();
      setTimeout(() => success = null, 3000);
    } catch (err: any) {
      error = err.message || "Delete failed";
      console.error("Error deleting admin:", err);
      
      Swal.fire({
        title: "Error",
        text: "Failed to delete admin. Please try again.",
        icon: "error"
      });
    }
  }

  const divisionOptions = $derived(() => [
    { value: "all", label: "All Divisions" },
    { value: "", label: "No Division" },
    ...divisions.map(division => ({ value: division.id, label: division.name }))
  ]);

  const ukmOptions = $derived(() => [
    { value: "all", label: "All UKMs" },
    { value: "", label: "No UKM" },
    ...ukms.map(ukm => ({ value: ukm.id, label: ukm.name }))
  ]);
  
  const fieldOptions = $derived(() => [
    { value: "all", label: "All Roles" },
    { value: "Ketua UKM", label: "Ketua UKM" },
    { value: "Panitia", label: "Panitia" }
  ]);

  const filteredAdmins = $derived(() => {
    let filtered: Admin[] = [...admins];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(admin => 
        admin.name.toLowerCase().includes(lowerSearch) ||
        admin.nrp.toLowerCase().includes(lowerSearch) ||
        admin.field.toLowerCase().includes(lowerSearch) ||
        (admin.division_name && admin.division_name.toLowerCase().includes(lowerSearch)) ||
        (admin.ukm_name && admin.ukm_name.toLowerCase().includes(lowerSearch))
      );
    }
    
    if (filterField !== "all") {
      filtered = filtered.filter(admin => admin.field === filterField);
    }

    return filtered;
  });

  function getDivisionName(divisionId: string | null): string {
    if (!divisionId) return "No Division";
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.name : "Unknown";
  }

  function getUkmName(ukmId: string | null): string {
    if (!ukmId) return "No UKM";
    const ukm = ukms.find(u => u.id === ukmId);
    return ukm ? ukm.name : "Unknown";
  }

  let searchTerm = $state("");
  let filterField = $state("all"); 
  
  let formData = $state({
	name: "",
	nrp: "",
	field: "",
	division_id: "",
	ukm_id: ""
});

$effect(() => {
	if (formData.ukm_id && !formData.division_id) {
		formData.field = "Ketua UKM";
	} else if (formData.division_id || (formData.ukm_id && formData.division_id)) {
		formData.field = "Panitia";
	}
});
</script>

<svelte:head>
  <title>OH Admin | Admin Management</title>
</svelte:head>

{#if !accessChecked}
  <div class="admin-card flex justify-center items-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-text-secondary"></div>
    <span class="ml-3 text-admin-text-secondary">Checking access...</span>
  </div>
{:else if !hasAccess}
  <div class="admin-card">
    <div class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-admin-text-tertiary mx-auto mb-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
      <h3 class="text-lg font-medium text-admin-text-primary mb-2">
        Access Denied
      </h3>
      <p class="text-admin-text-secondary mb-6">
        You don't have permission to access this page. Only IT division members can manage admins.
      </p>
      <button 
        onclick={() => window.location.href = "/admin"}
        class="admin-btn-primary"
      >
        Return to Dashboard
      </button>
    </div>
  </div>
{:else}
  <main class="admin-card">
    <div class="admin-card-header mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="admin-card-title">
        <h2 class="text-lg font-semibold text-admin-text-primary mb-1">
          Admin Management
        </h2>
        <p class="text-sm text-admin-text-secondary">
          Manage administrator accounts and permissions
        </p>
      </div>
      <div>
        <button 
          onclick={openCreateModal}
          class="admin-btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Create New Admin
        </button>
      </div>
    </div>

    <div class="admin-filters-section mb-6">
      <div class="flex flex-wrap gap-4 items-end w-full">
        <!-- Search -->
        <div class="admin-filter-group flex-1 min-w-full md:min-w-64">
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label class="admin-form-label">Search Admins</label>
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
              placeholder="Search by name, NRP, field..."
            />
          </div>
        </div>
        
        <div class="admin-filter-group w-full sm:w-auto">
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label class="admin-form-label">Role</label>
          <Dropdown
            options={fieldOptions()}
            bind:value={filterField}
            size="md"
            class="w-full sm:w-40"
          />
        </div>
      </div>
    </div>

    <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div class="text-sm text-admin-text-secondary">
        Showing <span class="font-medium text-admin-text-primary">{filteredAdmins().length}</span> of <span class="font-medium text-admin-text-primary">{admins.length}</span> admins
        {#if searchTerm || filterField !== 'all'}
          <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-admin-background text-admin-text-secondary">
            Filtered
          </span>
        {/if}
      </div>
      
      {#if searchTerm || filterField !== 'all'}
        <button
          onclick={() => { searchTerm = ''; filterField = 'all'; }}
          class="admin-btn-primary w-full sm:w-auto"
        >
          Clear filters
        </button>
      {/if}
    </div>

    <!-- Loading State -->
    {#if loading}
      <div class="flex justify-center items-center py-8 sm:py-12">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-admin-text-secondary sm:h-8 sm:w-8"></div>
        <span class="ml-2 text-admin-text-secondary text-sm sm:ml-3 sm:text-base">Loading admins...</span>
      </div>
    {:else if admins.length === 0}
      <!-- Empty State - No admins at all -->
      <div class="text-center py-8 sm:py-12">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-admin-text-tertiary mx-auto mb-3 sm:w-12 sm:h-12 sm:mb-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 11-7.5 0 5.971 5.971 0 017.5 0z" />
        </svg>
        <h3 class="text-base font-medium text-admin-text-primary mb-2 sm:text-lg sm:mb-2">
          No admins found
        </h3>
        <p class="text-admin-text-secondary mb-4 text-sm sm:text-base">
          Get started by creating your first admin.
        </p>
        <button onclick={openCreateModal} class="admin-btn-primary w-full sm:w-auto">
          Create New Admin
        </button>
      </div>
    {:else if filteredAdmins().length === 0}
      <!-- Empty State - No filtered admins -->
      <div class="text-center py-8 sm:py-12">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-admin-text-tertiary mx-auto mb-3 sm:w-12 sm:h-12 sm:mb-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 11-7.5 0 5.971 5.971 0 017.5 0z" />
        </svg>
        <h3 class="text-base font-medium text-admin-text-primary mb-2 sm:text-lg sm:mb-2">
          No admins match your filters
        </h3>
        <p class="text-admin-text-secondary mb-4 text-sm sm:text-base">
          Try adjusting your search or filters.
        </p>
        <button
          onclick={() => { searchTerm = ''; filterField = 'all'; }}
          class="admin-btn-primary w-full sm:w-auto"
        >
          Clear filters
        </button>
      </div>
    {:else}
      <!-- List View -->
      <div class="border border-admin-border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-admin-background">
                <th class="admin-table-header text-left">Admin</th>
                <th class="admin-table-header text-left">Division</th>
                <th class="admin-table-header text-left">UKM</th>
                <th class="admin-table-header text-left">Field</th>
                <th class="admin-table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-admin-card-bg">
              {#each filteredAdmins() as admin}
                <tr class="admin-table-row border-b border-admin-border hover:bg-admin-hover transition-colors">
                  <td class="admin-table-cell">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-admin-background rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-admin-text-tertiary">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div>
                        <div class="font-medium text-admin-text-primary">{admin.name}</div>
                        <div class="text-sm text-admin-text-tertiary font-mono">{admin.nrp}</div>
                      </div>
                    </div>
                  </td>
                  <td class="admin-table-cell">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-admin-background text-admin-text-secondary">
                      {getDivisionName(admin.division_id)}
                    </span>
                  </td>
                  <td class="admin-table-cell">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {admin.ukm_id ? 'bg-admin-background text-admin-text-secondary' : 'bg-admin-background text-admin-text-tertiary'}">
                      {getUkmName(admin.ukm_id)}
                    </span>
                  </td>
                  <td class="admin-table-cell">
                    {admin.field}
                  </td>
                  <td class="admin-table-cell">
                    <div class="flex space-x-2 justify-center">
                      <!-- svelte-ignore a11y_consider_explicit_label -->
                      <button 
                        onclick={() => openEditModal(admin)}
                        class="admin-action-btn admin-action-btn-secondary p-2"
                        title="Edit Admin"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <!-- svelte-ignore a11y_consider_explicit_label -->
                      <button 
                        onclick={() => deleteAdmin(admin)}
                        class="admin-action-btn admin-action-btn-error p-2"
                        title="Delete Admin"
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
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    {#if showCreateModal}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50" onclick={(e) => e.target === e.currentTarget && closeModal()}>
        <div class="admin-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
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
                    {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
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
          <div class="flex-1 overflow-y-auto">
            <form onsubmit={handleSubmit} class="h-full">
              <div class="p-4 sm:p-8">
                <!-- Error Message -->
                {#if error}
                  <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div class="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                      <div>
                        <h3 class="text-sm font-medium text-red-800">Error</h3>
                        <div class="mt-1 text-sm text-red-700">
                          {error}
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}

                <div class="space-y-6">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label for="name" class="block text-sm font-semibold text-admin-text-primary">
                        Full Name
                        <span class="text-red-500 ml-1">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="name"
                        bind:value={formData.name}
                        required
                        class="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div class="space-y-2">
                      <label for="nrp" class="block text-sm font-semibold text-admin-text-primary">
                        NRP
                        <span class="text-red-500 ml-1">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="nrp"
                        bind:value={formData.nrp}
                        required
                        class="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-white text-admin-text-primary placeholder-admin-text-tertiary"
                        placeholder="Enter NRP"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label for="field" class="block text-sm font-semibold text-admin-text-primary">
                      Field
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="field"
                      bind:value={formData.field}
                      readonly
                      class="w-full px-3 py-2 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-text-primary/20 focus:border-admin-text-primary transition-all bg-admin-background text-admin-text-primary placeholder-admin-text-tertiary"
                    />
                    <p class="text-xs text-admin-text-tertiary mt-1">
                      Field is automatically set to "Ketua UKM" when UKM is selected without division, otherwise "Panitia"
                    </p>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <!-- svelte-ignore a11y_label_has_associated_control -->
                      <label class="block text-sm font-semibold text-admin-text-primary">
                        Division (Optional)
                      </label>
                      <Dropdown
                        options={divisionOptions()}
                        bind:value={formData.division_id}
                        size="md"
                        class="w-full"
                        placeholder="Select Division"
                      />
                    </div>

                    <div class="space-y-2">
                      <!-- svelte-ignore a11y_label_has_associated_control -->
                      <label class="block text-sm font-semibold text-admin-text-primary">
                        UKM (Optional)
                      </label>
                      <Dropdown
                        options={ukmOptions()}
                        bind:value={formData.ukm_id}
                        size="md"
                        class="w-full"
                        placeholder="Select UKM"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Form Actions Footer -->
              <div class="border-t border-admin-border bg-admin-background px-4 py-4 sm:px-8 sm:py-6">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button 
                    type="button"
                    onclick={closeModal}
                    class="admin-btn-secondary w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    class="admin-btn-primary w-full sm:w-auto"
                  >
                    {editingAdmin ? 'Update Admin' : 'Create Admin'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    {/if}

    <!-- Success Toast -->
    {#if success}
      <div class="fixed bottom-4 right-4 z-50">
        <div class="bg-admin-success text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium">{success}</span>
        </div>
      </div>
    {/if}
  </main>
{/if}