<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "$lib/api";
  import type { UKM } from "$lib/stores/interfaces";
  import { stores } from "$lib/stores/logger";

  let ukms: UKM[] = [];
  let selectedUkm: string = "";
  let paymentFile: FileList;
  let driveUrl: string = "";
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const session = stores.session.get();
      if (!session || !session.isLoggedIn) {
        window.location.href = "/login";
        return;
      }
      
      ukms = await get<UKM[]>("/api/ukm");
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  async function handleSubmit() {
    error = null;
    if (!selectedUkm || !paymentFile || paymentFile.length === 0 || !driveUrl) {
      error = "Please fill all fields and select a file.";
      return;
    }

    const session = stores.session.get();
    if (!session || !session.isLoggedIn || !session.user?.nrp) {
      error = "You must be logged in to register.";
      return;
    }

    const formData = new FormData();
    formData.append("ukm_id", selectedUkm);
    formData.append("payment", paymentFile[0]);
    formData.append("drive_url", driveUrl);
    formData.append("nrp", session.user.nrp);

    try {
      await post("/api/registrations", formData);
      alert("Registration successful!");
      window.location.href = "/";
    } catch (err: any) {
      error = err.message;
    }
  }
</script>

<svelte:head>
  <title>Registration</title>
</svelte:head>

<div class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-6">UKM Registration</h1>

  {#if loading}
    <p>Loading UKMs...</p>
  {:else if error}
    <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
      <span class="font-medium">Error!</span> {error}
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div>
        <label for="ukm" class="block mb-2 text-sm font-medium text-gray-900">Select UKM</label>
        <select id="ukm" bind:value={selectedUkm} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
          <option value="" disabled>Choose a UKM</option>
          {#each ukms as ukm}
            <option value={ukm.id}>{ukm.name}</option>
          {/each}
        </select>
      </div>

      <div>
        <label for="payment" class="block mb-2 text-sm font-medium text-gray-900">Payment Proof</label>
        <input type="file" id="payment" bind:files={paymentFile} class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
        <p class="mt-1 text-sm text-gray-500" id="file_input_help">PNG, JPG, or PDF (MAX. 2MB).</p>
      </div>

      <div>
        <label for="drive_url" class="block mb-2 text-sm font-medium text-gray-900">Google Drive URL</label>
        <input type="url" id="drive_url" bind:value={driveUrl} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="https://docs.google.com/..." required />
         <p class="mt-1 text-sm text-gray-500">URL of the file you want to submit.</p>
      </div>

      <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Register</button>
    </form>
  {/if}
</div>
