<script lang="ts">
  import { PUBLIC_API_BASE } from "$env/static/public";
  import { get, getSessionValues } from "$lib/api";
  import { onMount } from "svelte";
  import Swal from "sweetalert2";
  import ValidateButton from "./ValidateButton.svelte";
  import RejectButton from "./RejectButton.svelte";

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
      ukms = await get("/api/ukms");
      participants = await get("/api/admin/participants");
    } catch (e: any) {
      error = e.message;
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
  const pageOptions = [5, 10, 15, 20, 25, 50];
  let searchTerm = $state("");
  let filterUkm = $state("all");
  let sortKey = $state<keyof Participant>("nrp");
  let sortDirection = $state<"asc" | "desc">("asc");
  let fileValidatedStatusFilters = $state<
    "all" | "accepted" | "rejected" | "pending"
  >("all");

  const filteredAndSortedData = $derived(() => {
    // Start with the original data
    let processedData = participants;

    // 1. Filtering Logic
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      processedData = participants.filter((item) =>
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
    Math.ceil(filteredAndSortedData().length / itemsPerPage),
  );

  const paginatedData = $derived(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData().slice(startIndex, endIndex);
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

  $effect(() => {
    console.log("Current totalPages:", totalPages);
  });

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
  <title>OH Admin | Participants</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between">
  <h1 class="text-2xl font-bold tracking-wide text-gray-800">
    List Pendaftar & Validasi
  </h1>
</div>

<div class="flex flex-col gap-2 rounded-2xl p-6 text-sm shadow-md">
  <div class="flex flex-wrap gap-2 font-semibold text-gray-600">
    {#if adminData.admin_division_slug !== "bph" && adminData.admin_division_slug !== "it"}
      <label for="ukmFilter" class="mt-2.5 text-center">UKM</label>
      <select
        id="ukmFilter"
        class="h-10 rounded border border-gray-300 p-2 text-gray-400"
        disabled
      >
        <option value="all">{adminData.admin_ukm_name}</option>
        {#each ukms as ukm}
          <option value={ukm.name}>{ukm.name}</option>
        {/each}
      </select>
    {:else}
      <label for="ukmFilter" class="mt-2.5 text-center">UKM</label>
      <select
        bind:value={filterUkm}
        id="ukmFilter"
        class="h-10 rounded border border-gray-300 p-2"
      >
        <option value="all">All</option>
        {#each ukms as ukm}
          <option value={ukm.name}>{ukm.name}</option>
        {/each}
      </select>
    {/if}
    <a
      href={exportUrl}
      class="min-h-10 rounded border border-gray-300 p-2"
      download
    >
      Download Excel
    </a>
    <button
      onclick={() => filterFileValidated("accepted")}
      class={[
        "h-10 rounded border",
        fileValidatedStatusFilters === "accepted"
          ? "border-indigo-600 p-2 text-indigo-600"
          : "border-gray-300 p-2",
      ]}
    >
      Accepted
    </button>
    <button
      onclick={() => filterFileValidated("rejected")}
      class={[
        "h-10 rounded border",
        fileValidatedStatusFilters === "rejected"
          ? "border-indigo-600 p-2 text-indigo-600"
          : "border-gray-300 p-2",
      ]}
    >
      Rejected
    </button>
    <button
      onclick={() => filterFileValidated("pending")}
      class={[
        "h-10 rounded border",
        fileValidatedStatusFilters === "pending"
          ? "border-indigo-600 p-2 text-indigo-600"
          : "border-gray-300 p-2",
      ]}
    >
      Pending
    </button>
  </div>
  <div
    class="flex h-10 max-w-lg items-center rounded border border-gray-300 font-semibold text-gray-600"
  >
    <input
      class="flex-grow p-2"
      type="text"
      bind:value={searchTerm}
      placeholder="Search table..."
    />
    <div
      class="flex h-full w-12 items-center justify-center bg-indigo-700 text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    </div>
  </div>

  <div class="overflow-auto">
    <table class="min-w-full table-fixed">
      <thead>
        <tr class="border-b border-b-gray-300 text-gray-800">
          {#each tableData.columns as column}
            <th
              class="group cursor-pointer p-2 text-left"
              onclick={() => handleSort(column.accessor)}
            >
              <div class="flex">
                {#if sortKey === column.accessor}
                  {#if sortDirection === "asc"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-4"
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
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-4"
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
                    class="size-4 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18"
                    />
                  </svg>
                {/if}
                <span>{column.Header}</span>
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each paginatedData() as participant (`${participant.id}-${participant.ukm_name}`)}
          <tr
            class="border-b border-b-gray-300 text-gray-600 transition hover:bg-amber-200"
          >
            <td class="p-2 ps-6">{participant.nrp}</td>
            <td class="p-2 ps-6 text-nowrap">{participant.name}</td>
            <td class="p-2 ps-6">{participant.ukm_name}</td>
            <td class="flex gap-4 p-2 ps-6">
              {#if participant.payment}
                <button
                  onclick={() => showPicture(participant.payment)}
                  class="rounded bg-sky-500 p-1 text-white hover:bg-sky-400 active:bg-sky-600"
                  >Payment</button
                >
              {/if}
              {#if participant.drive_url}
                <a
                  href={participant.drive_url}
                  class="rounded bg-sky-500 p-1 text-white hover:bg-sky-400 active:bg-sky-600"
                  >Portfolio</a
                >
              {/if}
            </td>
            <td class="p-2 ps-6">{participant.line_id}</td>
            <td class="p-2 ps-6">{participant.phone}</td>
            <td
              class={[
                "p-2 px-6 font-bold",
                participant.payment_validated === 0
                  ? "text-sky-500"
                  : participant.payment_validated === 1
                    ? "text-green-500"
                    : "text-red-500",
              ]}>{validationStatus[participant.payment_validated]}</td
            >
            <td class="text-nowrap">
              <ValidateButton nrp={participant.nrp} ukm={participant.ukm_id} />
              <RejectButton nrp={participant.nrp} ukm={participant.ukm_id} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <span>Rows per page</span>
    <select
      id="pagination"
      bind:value={itemsPerPage}
      class="border border-gray-300 p-2"
    >
      {#each pageOptions as num}
        <option value={num}>{num}</option>
      {/each}
    </select>
    <button
      onclick={() => {
        goToPage(1);
      }}
      aria-label="First Page"
      class="p-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
        />
      </svg>
    </button>
    <button onclick={previousPage} aria-label="Previous Page" class="p-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5 8.25 12l7.5-7.5"
        />
      </svg>
    </button>
    <span class="p-2">
      Page {currentPage} of {totalPages}
    </span>
    <button onclick={nextPage} aria-label="Next Page" class="p-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m8.25 4.5 7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
    <button
      onclick={() => {
        goToPage(totalPages);
      }}
      aria-label="Last Page"
      class="p-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  </div>
</div>

<style>
  .nav-mobile-closed {
    max-height: 0;
    overflow: hidden;
    /* We add opacity for a smoother fade effect alongside the slide */
    opacity: 0;
  }
  .nav-mobile-open {
    opacity: 1;
  }
  .nav-content {
    /* Apply transitions for a smooth animation */
    transition:
      max-height 0.3s ease-in-out,
      opacity 0.3s ease-in-out;
  }
</style>
