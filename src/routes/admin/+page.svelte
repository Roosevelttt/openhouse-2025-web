<script lang="ts">
  import { PUBLIC_API_BASE } from "$env/static/public";
  import { get, getSessionValues } from "$lib/api";
  import { onMount } from "svelte";
  import Swal from "sweetalert2";
  import ValidateButton from "./ValidateButton.svelte";
  import RejectButton from "./RejectButton.svelte";
  import Dropdown from "$lib/components/admin/Dropdown.svelte";

  type Ukm = {
    id: string;
    name: string;
    slug: string;
    current_slot: number;
    max_slot: number;
    regist_fee: number;
  };

  type Participant = {
    id: string;
    nrp: string;
    name: string;
    line_id: string;
    phone: string;
    ukm_id: string;
    ukm_name: string;
    payment: string;
    drive_url: string;
    file_validated: number;
    payment_validated: number;
    created_at: string;
    is_invited: number;
  };

  const validationStatus: Record<number, string> = {
    0: "Pending",
    1: "Accepted",
    2: "Rejected",
  };

  // Define a type for our column configuration
  type Column = {
    Header: string;
    accessor: keyof Participant; // This is the key change!
  };

  // Update your tableData state to use the new Column type
  let tableData = $state<{ columns: Column[] }>({
    columns: [
      { Header: "NRP", accessor: "nrp" },
      { Header: "Nama", accessor: "name" },
      { Header: "UKM", accessor: "ukm_name" },
      { Header: "File", accessor: "payment" },
      { Header: "Line ID", accessor: "line_id" },
      { Header: "Phone", accessor: "phone" },
      // { Header: "Tanggal Bayar", accessor: "created_at" }, // GA PAKAI kata rose
      // { Header: "File Validated", accessor: "file_validated" }, // GA PAKAI kata rose
      { Header: "Validated", accessor: "payment_validated" },
    ],
  });

  // Ensure tableData is properly structured
  const safeTableData = $derived(() => {
    if (!tableData || !Array.isArray(tableData.columns)) {
      return { columns: [] };
    }
    return tableData;
  });

  let adminData: Record<string, any> = $state({});
  let ukms: Array<Ukm> = $state([]);
  let participants: Array<Participant> = $state([]);

  let error: string | null = $state(null);
  onMount(async () => {
    try {
      adminData = await getSessionValues([
        "admin_ukm_id",
        "admin_ukm_name",
        "admin_division_slug",
      ]);
      
      try {
        const fetchedUkms = await get("/api/ukms");
        ukms = Array.isArray(fetchedUkms) ? fetchedUkms : [];
      } catch (ukmError) {
        console.error("Failed to fetch UKMs:", ukmError);
        ukms = [];
      }
      
      try {
        const fetchedParticipants = await get("/api/admin/participants");
        participants = Array.isArray(fetchedParticipants) ? fetchedParticipants : [];
      } catch (participantError) {
        console.error("Failed to fetch participants:", participantError);
        participants = [];
      }
    } catch (e: any) {
      error = e.message;
      console.error("Failed to fetch admin data:", e);
    }
  });

  // Construct the full, absolute URL for the download link
  const exportUrl = `${PUBLIC_API_BASE}/api/admin/export/participants`;

  let isMenuOpen = $state(false);

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  let currentPage = $state(1);
  let itemsPerPage = $state(15);
  const pageOptions = [5, 10, 15, 20, 25, 50].map(num => ({ value: num, label: num.toString() }));
  let searchTerm = $state("");
  let filterUkm = $state("all");
  let sortKey = $state<keyof Participant>("nrp");
  let sortDirection = $state<"asc" | "desc">("asc");
  let fileValidatedStatusFilters = $state<
    "all" | "accepted" | "rejected" | "pending"
  >("all");

  const ukmOptions = $derived([
    { value: "all", label: "Select UKM" },
    ...(Array.isArray(ukms) ? ukms : []).map(ukm => ({ value: ukm.name, label: ukm.name }))
  ]);

  const filteredAndSortedData = $derived(() => {
    if (!Array.isArray(participants)) {
      return [];
    }
    
    // Start with the original data
    let processedData = [...participants];

    // 1. Filtering Logic
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      processedData = processedData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(lowerCaseSearch),
        ),
      );
    }

    // Filter by UKM
    if (filterUkm !== "all") {
      processedData = processedData.filter(
        (item) => item.ukm_name === filterUkm,
      );
    }

    // Filter by File Validated status
    if (fileValidatedStatusFilters !== "all") {
      switch (fileValidatedStatusFilters) {
        case "pending":
          processedData = processedData.filter(
            (item) => item.payment_validated === 0,
          );
          break;
        case "accepted":
          processedData = processedData.filter(
            (item) => item.payment_validated === 1,
          );
          break;
        case "rejected":
          processedData = processedData.filter(
            (item) => item.payment_validated === 2,
          );
          break;
      }
    }

    // 2. Sorting Logic
    if (sortKey) {
      // Create a shallow copy before sorting to avoid mutating the original state
      processedData = [...processedData].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return processedData;
  });

  function handleSort(key: keyof Participant) {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  function filterFileValidated(
    file_validated: "accepted" | "rejected" | "pending",
  ) {
    if (file_validated === fileValidatedStatusFilters)
      fileValidatedStatusFilters = "all";
    else
      fileValidatedStatusFilters = file_validated as
        | "accepted"
        | "rejected"
        | "pending";
  }

  const totalPages = $derived(
    Math.ceil((Array.isArray(filteredAndSortedData()) ? filteredAndSortedData() : []).length / itemsPerPage),
  );

  const paginatedData = $derived(() => {
    // Ensure filteredAndSortedData returns an array
    const data = Array.isArray(filteredAndSortedData()) ? filteredAndSortedData() : [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  });

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }

  function showPicture(src: string) {
    // Construct the full URL to the payment file on the API server
    const imageUrl = `${PUBLIC_API_BASE}/uploads/payments/${src}`;

    Swal.fire({
      imageUrl: imageUrl,
      imageAlt: `Payment proof: ${src}`,
    });
  }
</script>

<svelte:head>
  <title>OH Admin - Participants</title>
</svelte:head>

<main class="admin-card">
  <div class="admin-card-header mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div class="admin-card-title">
      <h2 class="text-lg font-semibold text-admin-text-primary mb-1">
        Participants
      </h2>
      <p class="text-sm text-admin-text-secondary">
        Manage and validate participant registrations
      </p>
    </div>
    <div>
      <a
        href={exportUrl}
        class="admin-btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center"
        download
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Export Data
      </a>
    </div>
  </div>
  <div class="admin-filters-section">
    <div class="flex flex-wrap gap-4 items-end w-full">
      <!-- UKM Filter -->
      {#if adminData.admin_division_slug !== "bph" && adminData.admin_division_slug !== "it"}
        <div class="admin-filter-group w-full sm:w-auto">
          <label for="ukmFilter" class="admin-form-label">UKM</label>
          <Dropdown
            options={[{ value: "all", label: adminData.admin_ukm_name }]}
            value={"all"}
            disabled={true}
            size="md"
            class="w-full sm:w-48"
          />
        </div>
      {:else}
        <div class="admin-filter-group w-full sm:w-auto">
          <label for="ukmFilter" class="admin-form-label">UKM</label>
          <Dropdown
            options={ukmOptions}
            bind:value={filterUkm}
            placeholder="Select UKM"
            searchable={true}
            size="md"
            class="w-full sm:w-48"
          />
        </div>
      {/if}
      
      <!-- Status Filter Buttons -->
      <div class="w-full sm:w-auto">
        <div class="flex flex-col">
          <span class="admin-form-label">Status Filters</span>
          <div class="flex flex-wrap gap-2">
            <button
              onclick={() => filterFileValidated("pending")}
              class="admin-filter-btn {fileValidatedStatusFilters === 'pending' ? 'active' : ''}"
            >
              Pending
            </button>
            <button
              onclick={() => filterFileValidated("accepted")}
              class="admin-filter-btn {fileValidatedStatusFilters === 'accepted' ? 'active' : ''}"
            >
              Accepted
            </button>
            <button
              onclick={() => filterFileValidated("rejected")}
              class="admin-filter-btn {fileValidatedStatusFilters === 'rejected' ? 'active' : ''}"
            >
              Rejected
            </button>
          </div>
        </div>
      </div>
      
      <!-- Search -->
      <div class="admin-search-container flex-shrink-0 w-full sm:w-auto ml-0 sm:ml-auto">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="admin-form-label block">Search</label>
        <div class="relative">
          <input
            class="admin-form-input pl-10 pr-4 w-full sm:w-80"
            type="text"
            bind:value={searchTerm}
            placeholder="Search participants..."
          />
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
        </div>
      </div>
    </div>
  </div>

  <div class="border border-admin-border rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="bg-admin-background">
            {#each safeTableData().columns as column}
              <th
                class="admin-table-header group cursor-pointer text-left"
                onclick={() => handleSort(column.accessor)}
              >
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium uppercase tracking-wide text-admin-text-secondary">{column.Header}</span>
                  <div class="admin-sort-indicator">
                    {#if sortKey === column.accessor}
                      {#if sortDirection === "asc"}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="w-3 h-3 text-admin-text-primary"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18"
                          />
                        </svg>
                      {:else}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="w-3 h-3 text-admin-text-primary"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3"
                          />
                        </svg>
                      {/if}
                    {:else}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-3 h-3 text-admin-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18"
                        />
                      </svg>
                    {/if}
                  </div>
                </div>
              </th>
            {/each}
            <th class="admin-table-header text-center">
              <span class="text-xs font-medium uppercase tracking-wide text-admin-text-secondary">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-admin-card-bg">
          {#each Array.isArray(paginatedData()) ? paginatedData() : [] as participant (`${participant.id}-${participant.ukm_name}`)}
            <tr class="admin-table-row border-b border-admin-border hover:bg-admin-hover transition-colors">
              <td class="admin-table-cell font-mono text-sm">{participant.nrp}</td>
              <td class="admin-table-cell font-medium">{participant.name}</td>
              <td class="admin-table-cell">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-admin-background text-admin-text-secondary">
                  {participant.ukm_name}
                </span>
              </td>
              <td class="admin-table-cell">
                <div class="flex gap-2">
                  {#if participant.payment}
                    <button
                      onclick={() => showPicture(participant.payment)}
                      class="admin-file-btn"
                      title="View Payment Proof"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      Payment
                    </button>
                  {/if}
                  {#if participant.drive_url}
                    <a
                      href={participant.drive_url}
                      class="admin-file-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Portfolio"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      Portfolio
                    </a>
                  {/if}
                </div>
              </td>
              <td class="admin-table-cell font-mono text-sm">{participant.line_id}</td>
              <td class="admin-table-cell font-mono text-sm">{participant.phone}</td>
              <td class="admin-table-cell">
                <span class="admin-status-badge admin-status-{participant.payment_validated === 0 ? 'pending' : participant.payment_validated === 1 ? 'success' : 'error'}">
                  {validationStatus[participant.payment_validated]}
                </span>
              </td>
              <td class="admin-table-cell">
                <div class="flex gap-2 justify-center">
                  <ValidateButton nrp={participant.nrp} ukm={participant.ukm_id} />
                  <RejectButton nrp={participant.nrp} ukm={participant.ukm_id} />
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <div class="admin-pagination-container flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-admin-border bg-admin-card-bg rounded-b-lg">
    <div class="flex flex-wrap items-center gap-6 mb-4 md:mb-0">
      <div class="flex items-center gap-3">
        <span class="admin-form-label text-sm font-medium">Show:</span>
        <Dropdown
          options={pageOptions}
          bind:value={itemsPerPage}
          size="sm"
          class="w-20"
        />
        <span class="admin-form-label text-sm">entries</span>
      </div>
      <div class="text-sm text-admin-text-secondary">
        Showing <span class="font-medium text-admin-text-primary">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span class="font-medium text-admin-text-primary">{Math.min(currentPage * itemsPerPage, filteredAndSortedData().length)}</span> of <span class="font-medium text-admin-text-primary">{filteredAndSortedData().length}</span> entries
      </div>
    </div>
    
    <div class="admin-pagination-controls flex items-center gap-2">
      <button
        onclick={() => goToPage(1)}
        disabled={currentPage === 1}
        aria-label="First Page"
        class="admin-pagination-btn-extended"
        title="First Page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
        </svg>
        <span class="hidden sm:inline">First</span>
      </button>
      
      <button 
        onclick={previousPage} 
        disabled={currentPage === 1}
        aria-label="Previous Page" 
        class="admin-pagination-btn"
        title="Previous Page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      
      <div class="admin-pagination-info flex items-center px-4 py-2 bg-admin-background rounded border border-admin-border">
        <span class="text-sm font-medium text-admin-text-primary">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      
      <button 
        onclick={nextPage} 
        disabled={currentPage === totalPages}
        aria-label="Next Page" 
        class="admin-pagination-btn"
        title="Next Page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      
      <button
        onclick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last Page"
        class="admin-pagination-btn-extended"
        title="Last Page"
      >
        <span class="hidden sm:inline">Last</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  </div>
</main>