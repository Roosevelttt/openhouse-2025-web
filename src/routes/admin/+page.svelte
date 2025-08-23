<script lang="ts">
  import { get } from "$lib/api";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import logoSmall from "$lib/images/logo_oh_small.png";
  import Swal from "sweetalert2";
  import ValidateButton from "./ValidateButton.svelte";

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
    file_validated: number;
    payment_validated: number;
    created_at: string;
    is_invited: number;
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
      { Header: "Payment", accessor: "payment" },
      { Header: "Phone", accessor: "phone" },
      { Header: "Line ID", accessor: "line_id" },
      { Header: "Tanggal Bayar", accessor: "file_validated" },
      { Header: "Is Invited", accessor: "created_at" },
      { Header: "Payment Validated", accessor: "payment_validated" },
    ],
  });

  let ukms: Array<Ukm> = $state([]);
  let participants: Array<Participant> = $state([]);

  let error: string | null = $state(null);
  onMount(async () => {
    try {
      ukms = await get("/api/ukms");
      participants = await get("/api/participants");
    } catch (e: any) {
      error = e.message;
    }
  });

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
            (item) => item.file_validated === 0,
          );
          break;
        case "accepted":
          processedData = processedData.filter(
            (item) => item.file_validated === 1,
          );
          break;
        case "rejected":
          processedData = processedData.filter(
            (item) => item.file_validated === 2,
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
    Swal.fire({
      imageUrl: `${src}`,
      imageAlt: "A tall image",
    });
  }
</script>

<svelte:head>
  <title>OH Admin | Participants</title>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</svelte:head>

<div
  class="font-plus-jakarta-sans flex h-screen flex-col gap-4 transition-all md:flex-row"
>
  <nav
    class="inset-y-0 min-w-64 flex-col gap-6 bg-white text-sm font-semibold text-nowrap text-gray-800 shadow-lg md:fixed md:flex"
  >
    <button
      class="m-4 md:hidden"
      onclick={toggleMenu}
      aria-label="Toggle menu"
      aria-expanded={isMenuOpen}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        {#if isMenuOpen}
          <!-- X icon for closing -->
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        {:else}
          <!-- Hamburger icon for opening -->
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        {/if}
      </svg>
    </button>

    <!--  Mobile view  -->
    {#if isMenuOpen}
      <div
        class="flex h-full flex-col"
        class:nav-mobile-open={isMenuOpen}
        class:nav-mobile-closed={!isMenuOpen}
        transition:slide
      >
        <div class="flex justify-center">
          <img src={logoSmall} alt="Logo" class="w-32" />
        </div>
        <div class="flex h-full flex-col md:justify-between">
          <ul>
            <li>
              <a
                href="/admin/"
                class="ms-4 flex items-center gap-2 p-4"
                aria-label="Users"
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="size-6"
                  >
                    <path
                      d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z"
                    />
                  </svg>
                </span>
                <span>Participants</span>
              </a>
            </li>
          </ul>
          <div class="ms-4 flex items-center justify-between p-4">
            <div class="flex">
              Admin c14230260
              <span class="relative flex size-3">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"
                ></span>
                <span
                  class="relative inline-flex size-3 rounded-full bg-green-400"
                ></span>
              </span>
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
          </div>
        </div>
      </div>
    {/if}

    <!--Desktop view-->
    <div class="hidden h-full flex-col md:flex">
      <div class="flex justify-center">
        <img src={logoSmall} alt="Logo" class="w-48" />
      </div>
      <div class="flex h-full flex-col md:justify-between">
        <ul>
          <li>
            <a
              href="/admin/"
              class="ms-4 flex items-center gap-2 p-4"
              aria-label="Users"
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  class="size-6"
                >
                  <path
                    d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z"
                  />
                </svg>
              </span>
              <span>Participants</span>
            </a>
          </li>
        </ul>
        <div class="ms-4 flex justify-between p-4">
          <div class="flex">
            Admin c14230260
            <span class="relative flex size-3">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"
              ></span>
              <span
                class="relative inline-flex size-3 rounded-full bg-green-400"
              ></span>
            </span>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
            />
          </svg>
        </div>
      </div>
    </div>
  </nav>
  <nav class="flex flex-col gap-6 p-6 md:ms-64">
    <h1 class="text-2xl font-bold tracking-wide text-gray-800">
      List Pendaftar & Validasi
    </h1>

    <div class="flex flex-col gap-2 rounded-2xl p-6 text-sm shadow-md">
      <div class="flex flex-wrap gap-2 font-semibold text-gray-600">
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
        <button class="min-h-10 rounded border border-gray-300 p-2">
          Download CSV
        </button>
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
        <table class="table-fixed">
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
                <td class="p-2 ps-6">
                  {#if participant.payment}
                    <button
                      onclick={() => showPicture(participant.payment)}
                      class="rounded bg-sky-500 p-1 text-white hover:bg-sky-400 active:bg-sky-600"
                      >Show</button
                    >
                  {/if}
                </td>
                <td class="p-2 ps-6">{participant.line_id}</td>
                <td class="p-2 ps-6">{participant.phone}</td>
                <td class="p-2 ps-6"
                  >{new Date(participant.created_at).toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}</td
                >
                <td class="p-2 ps-6">{participant.is_invited}</td>
                <td class="p-2 ps-6">{participant.payment_validated}</td>
                <td class="text-nowrap">
                  <ValidateButton
                    nrp={participant.nrp}
                    ukm={participant.ukm_id}
                  />
                  <button
                    class="rounded bg-red-500 p-1 text-white hover:bg-red-400 active:bg-red-600"
                    >Reject</button
                  >
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
  </nav>
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
