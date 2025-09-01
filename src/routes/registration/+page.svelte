<script lang="ts">
  import { onMount } from "svelte";
  import { get, getCurrentUserInfo } from "$lib/api";
  import { goto } from "$app/navigation";
  import Swal from "sweetalert2";

  let ukms: Array<{ id: string; name: string; slug: string; current_slot: number; max_slot: number; regist_fee: number }> = [];
  let error: string | null = null;
  let isAuthenticated = false;
  
  onMount(async () => {
    try { 
      // Check if user is authenticated
      const userInfo = await getCurrentUserInfo();
      isAuthenticated = !!userInfo;
      
      ukms = await get('/api/ukms'); 
    } catch (e: any) { 
      error = e.message; 
    }
  });

  async function handleRegisterClick(ukmSlug: string, ukmName: string) {
    if (!isAuthenticated) {
      await Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in first to register for UKM',
        confirmButtonText: 'Go to Login'
      });
      
      Swal.fire({
        title: 'Redirecting...',
        text: 'Taking you to the login page',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      setTimeout(() => {
        Swal.close();
        goto('/login');
      }, 1000);
      return;
    }

    // Show loading while redirecting to biodata
    Swal.fire({
      title: 'Redirecting...',
      text: `Taking you to complete biodata for ${ukmName}`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Close the swal and redirect after a short delay
    setTimeout(() => {
      Swal.close();
      goto(`/biodata?ukm_slug=${ukmSlug}`);
    }, 1000);
  }
</script>

<svelte:head>
  <title>UKM List - Registration</title>
</svelte:head>

<div class="container mx-auto p-8">
  <div class="mb-8 text-center">
    <h1 class="text-4xl font-bold text-gray-800 mb-2">UKM Registration</h1>
    <p class="text-gray-600">Choose a UKM (Unit Kegiatan Mahasiswa) to register</p>
  </div>

  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-center" role="alert">
      <div class="flex items-center justify-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-medium">Error!</span>
      </div>
      <p class="mt-1">{error}</p>
    </div>
  {:else if ukms.length === 0}
    <div class="text-center py-16">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m-2 0v-2a2 2 0 012-2h2m12 0h2m-2 0a2 2 0 012 2v2"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No UKMs Available</h3>
      <p class="text-gray-500">There are currently no UKMs available for registration.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each ukms as ukm}
        <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div class="p-6">
            <div class="mb-4">
              <h2 class="text-xl font-bold text-gray-800 mb-2">{ukm.name}</h2>
              <p class="text-sm text-gray-500 uppercase tracking-wide">Slug: {ukm.slug}</p>
            </div>
            
            <div class="space-y-3 mb-6">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Registration Fee:</span>
                <span class="text-lg font-bold text-green-600">
                  {ukm.regist_fee > 0 ? `Rp ${ukm.regist_fee.toLocaleString('id-ID')}` : 'Free'}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Available Slots:</span>
                <span class="text-sm font-semibold text-blue-600">
                  {ukm.current_slot}/{ukm.max_slot}
                </span>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style="width: {((ukm.current_slot / ukm.max_slot) * 100)}%"
                ></div>
              </div>
              
              {#if ukm.current_slot >= ukm.max_slot}
                <p class="text-xs text-red-600 font-medium">⚠️ Registration Full</p>
              {:else}
                <p class="text-xs text-green-600 font-medium">✅ Registration Open</p>
              {/if}
            </div>
            
            <button 
              on:click={() => handleRegisterClick(ukm.slug, ukm.name)}
              disabled={ukm.current_slot >= ukm.max_slot || !isAuthenticated}
              class="w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors duration-200 {
                ukm.current_slot >= ukm.max_slot || !isAuthenticated
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }"
            >
              {#if ukm.current_slot >= ukm.max_slot}
                Registration Closed
              {:else if !isAuthenticated}
                Please Login First
              {:else}
                Register Now
              {/if}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
  }
</style>
