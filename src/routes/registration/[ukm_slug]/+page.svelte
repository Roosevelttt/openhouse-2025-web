<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { get, post, getCurrentUserInfo, getUserBiodata, reserveSlot, registerWithReservation } from '$lib/api';
  import { goto } from '$app/navigation';
  import Swal from "sweetalert2";

  // Get the slug from the URL parameter
  $: slug = $page.params.ukm_slug;

  let ukm: { id: string; name: string; slug: string; current_slot: number; max_slot: number; regist_fee: number; qris_url?: string } | null = null;
  let userNrp: string | null = null;
  let userName: string | null = null;
  let loading = true;
  let error: string | null = null;
  let success = false;

  // Form data
  let paymentFile: FileList;
  let driveUrl: string = '';
  let submitting = false;
  let reservationId: string | null = null;
  let reservationExpiry: Date | null = null;

  onMount(async () => {
    try {
      // Get user info (NRP and name) from session
      const userInfo = await getCurrentUserInfo();
      
      if (!userInfo) {
        error = 'You must be logged in to register for UKM';
        loading = false;
        return;
      }
      
      userNrp = userInfo.nrp;
      userName = userInfo.name;

      // Check if user has completed biodata
      try {
        const biodata = await getUserBiodata();
        
        if (!biodata || !biodata.line_id || !biodata.phone) {
          // User biodata is incomplete, redirect to biodata page with UKM slug
          await Swal.fire({
            icon: 'info',
            title: 'Complete Your Biodata',
            text: 'Please complete your biodata first before registering for UKM',
            confirmButtonText: 'Go to Biodata'
          });
          
          Swal.fire({
            title: 'Redirecting...',
            text: 'Please wait while we redirect you to the biodata page',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          setTimeout(() => {
            Swal.close();
            goto(`/biodata?ukm_slug=${slug}`);
          }, 1000);
          return;
        }
      } catch (e) {
        // If there's an error fetching biodata, assume user needs to complete it
        console.error('Error checking biodata:', e);
        await Swal.fire({
          icon: 'info',
          title: 'Complete Your Biodata',
          text: 'Please complete your biodata first before registering for UKM',
          confirmButtonText: 'Go to Biodata'
        });
        
        Swal.fire({
          title: 'Redirecting...',
          text: 'Please wait while we redirect you to the biodata page',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        setTimeout(() => {
          Swal.close();
          goto(`/biodata?ukm_slug=${slug}`);
        }, 1000);
        return;
      }

      // Fetch all UKMs and find the one with matching slug
      const ukms = await get('/api/ukms');
      ukm = ukms.find((u: any) => u.slug === slug) || null;
      
      if (!ukm) {
        error = 'UKM not found';
      }
    } catch (e: any) {
      error = e.message || 'Failed to load UKM data';
      console.error('Error loading UKM:', e);
    } finally {
      loading = false;
    }
  });

  async function handleSubmit() {
    if (!ukm || !userNrp || !paymentFile || paymentFile.length === 0 || !driveUrl.trim()) {
      await Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        text: 'Please fill all fields and select a payment proof file.'
      });
      return;
    }

    submitting = true;
    error = null;

    try {
      // Step 1: Reserve a slot first
      Swal.fire({
        title: 'Reserving Slot...',
        text: 'Securing your spot for registration',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const reservation = await reserveSlot(ukm.id);
      reservationId = reservation.reservation_id;
      reservationExpiry = new Date(reservation.expires_at);

      // Step 2: Show upload progress
      Swal.fire({
        title: 'Uploading Registration...',
        text: 'Please wait while we process your registration',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Step 3: Submit registration with reservation
      const registrationData = {
        ukm_id: ukm.id,
        payment: paymentFile[0].name, // For now just store filename, later we'll handle file upload
        drive_url: driveUrl.trim()
      };

      console.log('Submitting registration with reservation:', {
        reservation_id: reservationId,
        registration_data: registrationData
      });

      await registerWithReservation(reservationId, registrationData);
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: `You have successfully registered for ${ukm.name}`,
        confirmButtonText: 'OK'
      });
      
      success = true;
    } catch (e: any) {
      console.error('Registration error:', e);
      
      let errorMessage = e.message || 'Registration failed. Please try again.';
      
      // Handle specific errors
      if (e.message === 'No slots available') {
        errorMessage = 'Sorry, all slots for this UKM are full. Please try registering for another UKM.';
      } else if (e.message === 'reservation has expired') {
        errorMessage = 'Your slot reservation has expired. Please try again.';
      } else if (e.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to server. Please check if the API server is running.';
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage
      });
      
      error = errorMessage;
      reservationId = null;
      reservationExpiry = null;
    } finally {
      submitting = false;
    }
  }
   

  function goBack() {
    Swal.fire({
      title: 'Redirecting...',
      text: 'Taking you back to UKM list',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    setTimeout(() => {
      Swal.close();
      window.location.href = '/registration';
    }, 1000);
  }
</script>

<svelte:head>
  <title>{ukm ? `Register for ${ukm.name}` : 'UKM Registration'}</title>
</svelte:head>

<div class="container mx-auto p-8 max-w-2xl">
  {#if loading}
    <div class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="ml-4 text-gray-600">Loading UKM details...</p>
    </div>
  {:else if error && !ukm}
    <div class="text-center py-16">
      <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
        <span class="font-medium">Error:</span> {error}
      </div>
      <button 
        on:click={goBack}
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
      >
        Back to UKM List
      </button>
    </div>
  {:else if success}
    <div class="text-center py-16">
      <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
        <h2 class="text-xl font-bold mb-2">Registration Successful! ✅</h2>
        <p>Your registration for <strong>{ukm?.name}</strong> has been submitted successfully.</p>
        <p class="text-sm mt-2">You will receive confirmation once your payment is verified.</p>
      </div>
      <button 
        on:click={goBack}
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
      >
        Back to UKM List
      </button>
    </div>
  {:else if ukm}
    <!-- UKM Info Header -->
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-3xl font-bold text-gray-800">{ukm.name}</h1>
        <button 
          on:click={goBack}
          class="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          ← Back to UKM List
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Registration Fee</p>
          <p class="text-xl font-bold text-blue-600">
            {ukm.regist_fee > 0 ? `Rp ${ukm.regist_fee.toLocaleString('id-ID')}` : 'Free'}
          </p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Available Slots</p>
          <p class="text-xl font-bold text-green-600">{ukm.max_slot - ukm.current_slot} left</p>
        </div>
      </div>  
    </div>

    <!-- User Info Section -->
    {#if userName && userNrp}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <p class="text-sm text-blue-800">
              <span class="font-medium">Registering as:</span> {userName}
            </p>
            <p class="text-xs text-blue-600">NRP: {userNrp}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Registration Form -->
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Registration Form</h2>

      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          <span class="font-medium">Error:</span> {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <!-- Hidden UKM ID field -->
        <input type="hidden" value={ukm.id} />
       
        <!-- QRIS Payment Code -->
        {#if ukm.qris_url}
          <div class="text-center mb-6">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Payment QR Code</h3>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
              <img 
                src="/src/lib/images/{ukm.qris_url}" 
                alt="QRIS Payment Code for {ukm.name}"
                class="max-w-xs mx-auto rounded-lg shadow-sm"
              />
            </div>
            <p class="mt-2 text-sm text-gray-600">
              Scan this QR code to make payment for {ukm.name}
            </p>
            <p class="text-sm font-medium text-blue-600">
              Amount: {ukm.regist_fee > 0 ? `Rp ${ukm.regist_fee.toLocaleString('id-ID')}` : 'Free'}
            </p>
          </div>
        {/if}

        <!-- Payment Proof Upload -->
        <div>
          <label for="payment" class="block text-sm font-medium text-gray-700 mb-2">
            Payment Proof <span class="text-red-500">*</span>
          </label>
          <input 
            type="file" 
            id="payment" 
            bind:files={paymentFile}
            accept="image/*,.pdf"
            required
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="mt-1 text-sm text-gray-500">
            Upload proof of payment (PNG, JPG, or PDF, max 5MB)
          </p>
        </div>

        <!-- Google Drive URL -->
        <div>
          <label for="drive_url" class="block text-sm font-medium text-gray-700 mb-2">
            Portfolio Link (Google Drive URL) <span class="text-red-500">*</span>
          </label>
          <input 
            type="url" 
            id="drive_url" 
            bind:value={driveUrl}
            placeholder="https://drive.google.com/..."
            required
            class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="mt-1 text-sm text-gray-500">
            Share a Google Drive link to your portfolio documents
          </p>
        </div>

        <!-- Submit Button -->
        <div class="pt-6">
          {#if reservationId}
            <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <p class="font-medium">Slot Reserved!</p>
                  <p class="text-sm">Your slot expires at: {reservationExpiry?.toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          {/if}
          
          <button 
            type="submit"
            disabled={submitting}
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 {submitting ? 'cursor-not-allowed' : ''}"
          >
            {#if submitting}
              {reservationId ? 'Completing Registration...' : 'Reserving Slot...'}
            {:else}
              Reserve Slot & Register
            {/if}
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
  }
</style>

