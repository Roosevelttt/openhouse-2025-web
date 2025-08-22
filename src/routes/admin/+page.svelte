<script lang="ts">
  import { get } from "$lib/api";
  import { onMount } from "svelte";
  import logoSmall from "$lib/images/logo_oh_small.png";
  import Swal from "sweetalert2";
  import ValidateButton from "./ValidateButton.svelte";

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

  let participants: Array<Participant> = $state([]);

  let error: string | null = $state(null);
  onMount(async () => {
    try {
      participants = await get("/api/participants");
    } catch (e: any) {
      error = e.message;
    }
  });

  let currentPage = $state(1);
  let itemsPerPage = $state(5);
  let searchTerm = $state("");
  let sortKey = $state<keyof Participant>("nrp");
  let sortDirection = $state<"asc" | "desc">("asc");

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

<div class="font-plus-jakarta-sans flex h-screen">
  <nav class="flex min-w-xs flex-col gap-6 text-nowrap">
    <div class="flex justify-center">
      <img src={logoSmall} alt="Logo" class="w-48" />
    </div>
    <ul>
      <li>
        <a
          href="/admin/users"
          class="ms-4 flex items-center gap-2 p-4"
          aria-label="Users"
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
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
      <li>
        <a
          href="/admin/users"
          class="ms-4 flex items-center gap-2 p-4"
          aria-label="Users"
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-6"
            >
              <path
                d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 0 1 .878.645 49.17 49.17 0 0 1 .376 5.452.657.657 0 0 1-.66.664c-.354 0-.675-.186-.958-.401a1.647 1.647 0 0 0-1.003-.349c-1.035 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401.31 0 .557.262.534.571a48.774 48.774 0 0 1-.595 4.845.75.75 0 0 1-.61.61c-1.82.317-3.673.533-5.555.642a.58.58 0 0 1-.611-.581c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959a.641.641 0 0 1-.658.643 49.118 49.118 0 0 1-4.708-.36.75.75 0 0 1-.645-.878c.293-1.614.504-3.257.629-4.924A.53.53 0 0 0 5.337 15c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401a.656.656 0 0 0 .659-.663 47.703 47.703 0 0 0-.31-4.82.75.75 0 0 1 .83-.832c1.343.155 2.703.254 4.077.294a.64.64 0 0 0 .657-.642Z"
              />
            </svg>
          </span>

          <span>Letters Generate </span>
        </a>
      </li>
    </ul>
  </nav>
  <nav class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">List Pendaftar & Validasi</h1>

    <div class="flex flex-col">
      <div class="flex items-center gap-2">
        <label for="ukmFilter">UKM</label>
        <select id="ukmFilter" class="border border-gray-300 p-2">
          <option value="all">All</option>
        </select>
        <button class="border border-gray-300 p-2"> Download CSV </button>
        <button class="border border-gray-300 p-2"> Accepted </button>
        <button class="border border-gray-300 p-2"> Rejected </button>
        <button class="border border-gray-300 p-2"> Pending </button>
      </div>
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Search table..."
      />
      <div>
        <table>
          <thead>
            <tr>
              <th class="p-2 text-left" onclick={() => handleSort("nrp")}
                >NRP</th
              >
              <th class="p-2 text-left" onclick={() => handleSort("name")}
                >Nama</th
              >
              <th class="p-2 text-left" onclick={() => handleSort("ukm_name")}
                >UKM</th
              >
              <th class="p-2 text-left" onclick={() => handleSort("payment")}
                >File</th
              >
              <th class="p-2 text-left" onclick={() => handleSort("line_id")}
                >Line ID</th
              >
              <th class="p-2 text-left" onclick={() => handleSort("phone")}
                >Phone</th
              >
              <th class="p-2 text-left" onclick={() => handleSort("created_at")}
                >Tanggal Bayar</th
              >
              <th class="p-2 text-left" onclick={() => handleSort("is_invited")}
                >Status Seleksi</th
              >
              <th
                class="p-2 text-left"
                onclick={() => handleSort("payment_validated")}
                >Status Payment</th
              >
            </tr>
          </thead>
          <tbody>
            {#each paginatedData() as participant (`${participant.id}-${participant.ukm_name}`)}
              <tr>
                <td class="p-2">{participant.nrp}</td>
                <td class="p-2 text-nowrap">{participant.name}</td>
                <td class="p-2">{participant.ukm_name}</td>
                <td class="p-2">
                  {#if participant.payment}
                    <button
                      onclick={() => showPicture(participant.payment)}
                      class="rounded bg-sky-500 p-1 text-white hover:bg-sky-400 active:bg-sky-600"
                      >Show</button
                    >
                  {/if}
                </td>
                <td class="p-2">{participant.line_id}</td>
                <td class="p-2">{participant.phone}</td>
                <td class="p-2"
                  >{new Date(participant.created_at).toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}</td
                >
                <td class="p-2">{participant.is_invited}</td>
                <td class="p-2">{participant.payment_validated}</td>
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
      <div class="flex items-center justify-center">
        <span>Rows per page</span>
        <select bind:value={itemsPerPage} class="border border-gray-300 p-2">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="25">25</option>
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
  </nav>
</div>
