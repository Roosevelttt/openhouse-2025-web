<script lang="ts">
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
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

  // Timer related variables
  let timeRemaining = 0;
  let timerInterval: any = null;
  let formattedTime = '00:00';

  // Get reservation data from URL parameters
  $: reservationParam = $page.url.searchParams.get('reservation');
  
  // Parse reservation data if available
  $: if (reservationParam) {
    try {
      const reservationData = JSON.parse(decodeURIComponent(reservationParam));
      console.log('Parsed reservation data:', reservationData);
      
      reservationId = reservationData.reservation_id;
      
      // Simplified date parsing - expecting RFC3339 format from API
      const expiresAtStr = reservationData.expires_at;
      console.log('Raw expires_at string:', expiresAtStr);
      console.log('Type of expires_at:', typeof expiresAtStr);
      
      if (expiresAtStr) {
        // Parse the date directly - should be RFC3339 format
        const parsedDate = new Date(expiresAtStr);
        
        console.log('Attempting to parse date:', expiresAtStr);
        console.log('Parsed date result:', parsedDate);
        console.log('Is valid date:', !isNaN(parsedDate.getTime()));
        console.log('Current time:', new Date());
        console.log('Time difference (ms):', parsedDate.getTime() - new Date().getTime());
        console.log('Time difference (minutes):', (parsedDate.getTime() - new Date().getTime()) / (1000 * 60));
        
        // Check if the date is valid and in the future
        if (!isNaN(parsedDate.getTime())) {
          const timeDiff = parsedDate.getTime() - new Date().getTime();
          if (timeDiff > 0) {
            reservationExpiry = parsedDate;
            console.log('Final reservation expiry set to:', reservationExpiry);
          } else {
            console.warn('Parsed date is in the past! Diff:', timeDiff);
            reservationExpiry = null;
          }
        } else {
          console.error('Invalid date format:', expiresAtStr);
          reservationExpiry = null;
        }
      }
    
      if (reservationExpiry) {
        console.log('Starting timer with expiry:', reservationExpiry);
        startTimer();
      } else {
        console.log('No valid reservation expiry, not starting timer');
      }
    } catch (e) {
      console.error('Failed to parse reservation data:', e);
    }
  }

  function startTimer() {
    if (!reservationExpiry) return;
    
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    if (!reservationExpiry) {
      console.log('updateTimer: No reservationExpiry');
      return;
    }
    
    const now = new Date();
    const diff = reservationExpiry.getTime() - now.getTime();
    
    console.log('updateTimer called:');
    console.log('  Current time:', now);
    console.log('  Expiry time:', reservationExpiry);
    console.log('  Time difference (ms):', diff);
    console.log('  Time difference (seconds):', Math.floor(diff / 1000));
    
    if (diff <= 0) {
      console.log('Timer expired, stopping timer');
      timeRemaining = 0;
      formattedTime = '00:00';
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
      // Show expiry message and redirect
      Swal.fire({
        icon: 'warning',
        title: 'Reservation Expired',
        text: 'Your slot reservation has expired. Please try again.',
        confirmButtonText: 'Go Back'
      }).then(() => {
        goto('/registration');
      });
      return;
    }
    
    timeRemaining = Math.floor(diff / 1000);
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    console.log('  Time remaining (seconds):', timeRemaining);
    console.log('  Formatted time:', formattedTime);
  }

  onDestroy(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  });

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
      const ukms = await get('/api/ukms') as any[];
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
    // Check if reservation is still valid
    if (!reservationId) {
      await Swal.fire({
        icon: 'error',
        title: 'No Reservation',
        text: 'You do not have a valid slot reservation. Please go back and reserve a slot first.'
      });
      return;
    }

    if (timeRemaining <= 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Reservation Expired',
        text: 'Your slot reservation has expired. Please try again.'
      });
      goto('/registration');
      return;
    }

    // Skip payment file validation for esport and menwa
    const isFreeUkm = slug === 'esport' || slug === 'menwa';
    const needsPayment = !isFreeUkm;
    
    if (!ukm || !userNrp || (needsPayment && (!paymentFile || paymentFile.length === 0))) {
      const message = needsPayment 
        ? 'Please fill all required fields and select a payment proof file.'
        : 'Please fill all required fields.';
      
      await Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        text: message
      });
      return;
    }

    submitting = true;
    error = null;

    try {
      // Show upload progress
      Swal.fire({
        title: 'Uploading Registration...',
        text: 'Please wait while we process your registration',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Submit registration with existing reservation
      const isFreeUkm = slug === 'esport' || slug === 'menwa';
      const registrationData = {
        ukm_id: ukm.id,
        payment: isFreeUkm ? null : paymentFile[0].name, // No payment file for free UKMs
        drive_url: driveUrl.trim()
      };

      console.log('Submitting registration with existing reservation:', {
        reservation_id: reservationId,
        registration_data: registrationData
      });

      await registerWithReservation(reservationId, registrationData);
      
      // Clear the timer since registration is complete
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
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
      } else if (e.message === 'user has already registered for this UKM') {
        errorMessage = 'You have already registered for this UKM. Each person can only register once per UKM.';
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
      text: 'Taking you back to Homepage',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    setTimeout(() => {
      Swal.close();
      window.location.href = '/';
    }, 1000);
  }
</script>

<svelte:head>
  <title>{ukm ? `Register for ${ukm.name}` : 'UKM Registration'}</title>
</svelte:head>

<div class="container mx-auto p-8 max-w-2xl">
  {#if loading}
    <div class="flex justify-center items-center py-16">
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-4 border-yellow-300">
        <div class="flex items-center space-x-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
          <p class="text-purple-800 font-bold text-lg">🎪 Loading carnival magic...</p>
        </div>
      </div>
    </div>
  {:else if error && !ukm}
    <div class="text-center py-16">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-red-400 max-w-md mx-auto">
        <div class="text-6xl mb-4">🎭</div>
        <div class="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-r-xl mb-6">
          <span class="font-bold">Oops!</span> {error}
        </div>
        <button 
          on:click={goBack}
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          🎪 Back to Carnival
        </button>
      </div>
    </div>
  {:else if success}
    <div class="text-center py-16">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-green-400 max-w-lg mx-auto">
        <div class="text-6xl mb-4 animate-bounce">🎉</div>
        <div class="bg-green-50 border-l-4 border-green-500 text-green-800 px-6 py-6 rounded-r-xl mb-6">
          <h2 class="text-2xl font-bold mb-3 text-green-700">🎊 Welcome to the Show! 🎊</h2>
          <p class="text-lg mb-2">Your registration for <strong class="text-green-800">{ukm?.name}</strong> has been submitted successfully!</p>
          <p class="text-sm mt-3 text-green-600">🎪 You will receive confirmation once your payment is verified.</p>
          <p class="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
            ✅ <strong>Don't forget!</strong> Fill this questionnaire: 
            <a class="text-blue-600 underline hover:text-blue-800 font-medium" href="https://docs.google.com/forms/d/e/1FAIpQLScdreCQ1Uk97NQfMV8K2jRpGerpM2AcJe_qmHWMisCe0xB4tw/viewform" target="_blank">Click Here</a>
          </p>
        </div>
        <button 
          on:click={goBack}
          class="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          🎠 Back to Carnival
        </button>
      </div>
    </div>
  {:else if ukm}
    <!-- UKM Info Header -->
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-yellow-300 p-8 mb-8 relative overflow-hidden">
      <!-- Carnival Header Decoration -->
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-purple-400"></div>
      <div class="absolute -top-1 -left-1 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
      <div class="absolute -top-1 -right-1 w-6 h-6 bg-red-400 rounded-full animate-pulse"></div>
      
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <div class="text-4xl animate-bounce">🎪</div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {ukm.name}
          </h1>
        </div>
        <button 
          on:click={goBack}
          class="text-purple-600 hover:text-purple-800 text-sm underline font-medium bg-white/50 px-3 py-1 rounded-full"
        >
          ← Back to Carnival
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
        <div class="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl border-2 border-blue-300 relative">
          <div class="absolute -top-2 -right-2 text-2xl">💰</div>
          <p class="text-sm text-blue-700 font-medium mb-2">🎫 Registration Fee</p>
          <p class="text-2xl font-bold text-blue-800">
            {ukm.regist_fee > 0 ? `Rp ${ukm.regist_fee.toLocaleString('id-ID')}` : '🎁 Free!'}
          </p>
        </div>
        <div class="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl border-2 border-green-300 relative">
          <div class="absolute -top-2 -right-2 text-2xl">🎟️</div>
          <p class="text-sm text-green-700 font-medium mb-2">🎪 Available Slots</p>
          <p class="text-2xl font-bold text-green-800">{ukm.max_slot - ukm.current_slot} left</p>
        </div>
      </div>  
    </div>

    <!-- User Info Section -->
    {#if userName && userNrp}
      <div class="bg-white/90 backdrop-blur-sm border-2 border-blue-300 rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 text-3xl opacity-20">🎭</div>
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p class="text-lg font-bold text-blue-800">
              <span class="text-purple-600">🎪 Performer:</span> {userName}
            </p>
            <p class="text-sm text-blue-600 font-medium">🎫 Ticket ID: {userNrp}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Reservation Timer Section -->
    {#if reservationId && timeRemaining > 0}
      <div class="bg-gradient-to-r from-yellow-100 to-orange-100 border-3 border-yellow-400 rounded-3xl p-6 mb-6 relative overflow-hidden {timeRemaining <= 60 ? 'timer-warning animate-pulse' : ''}">
        <!-- Carnival Timer Decoration -->
        <div class="absolute top-2 right-2 text-2xl animate-spin">🎪</div>
        <div class="absolute bottom-2 left-2 text-xl animate-bounce">⏰</div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <p class="text-lg font-bold text-yellow-800">
                {#if timeRemaining <= 60}
                  🚨 Show's Almost Starting! Complete payment quickly! 🚨
                {:else}
                  🎟️ Your seat is reserved! Complete payment within:
                {/if}
              </p>
              <p class="text-sm text-orange-700 font-medium">🎫 Reservation ID: {reservationId.slice(0, 8)}...</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-4xl font-bold timer-text bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent {timeRemaining <= 60 ? 'animate-bounce' : ''}">
              {formattedTime}
            </div>
            <p class="text-sm text-orange-700 font-medium">minutes remaining</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="w-full bg-yellow-200 rounded-full h-4 border-2 border-yellow-400">
            <div 
              class="timer-progress h-full rounded-full transition-all duration-1000 ease-linear {timeRemaining <= 60 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}" 
              style="width: {(timeRemaining / 300) * 100}%"
            ></div>
          </div>
        </div>
        {#if timeRemaining <= 60}
          <div class="mt-4 p-3 bg-red-100 border-l-4 border-red-500 rounded-r-xl">
            <p class="text-sm text-red-700 font-bold animate-pulse">
              🎪 Last call! Less than 1 minute remaining! Submit your registration now to secure your spot in the show! 🎪
            </p>
          </div>
        {/if}
      </div>
    {:else if reservationId && timeRemaining <= 0}
      <div class="bg-gradient-to-r from-red-100 to-pink-100 border-3 border-red-400 rounded-3xl p-6 mb-6 relative">
        <div class="absolute top-2 right-2 text-2xl">😔</div>
        <div class="flex items-center space-x-4">
          <div class="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p class="text-lg font-bold text-red-800">
              🎭 Show Has Started Without You!
            </p>
            <p class="text-sm text-red-600">Your reservation has expired. Please try again to get a new seat!</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Registration Form -->
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-purple-300 p-8 relative overflow-hidden">
      <!-- Carnival Form Decoration -->
      <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400"></div>
      <div class="absolute -top-2 left-4 w-8 h-8 bg-yellow-400 rounded-full border-2 border-white"></div>
      <div class="absolute -top-2 right-4 w-8 h-8 bg-pink-400 rounded-full border-2 border-white"></div>
      
      <div class="flex items-center space-x-3 mb-8">
        <div class="text-3xl animate-bounce">🎪</div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Join the Show!</h2>
      </div>

      {#if error}
        <div class="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-r-xl mb-6 relative">
          <div class="absolute -left-1 top-2 text-xl">🚨</div>
          <span class="font-bold ml-6">Oops!</span> {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <!-- Hidden UKM ID field -->
        <input type="hidden" value={ukm.id} />
       
        <!-- QRIS Payment Code -->
        {#if ukm.qris_url && slug !== 'esport' && slug !== 'menwa'}
          <div class="text-center mb-8">
            <div class="flex items-center justify-center space-x-2 mb-6">
              <div class="text-2xl">💳</div>
              <h3 class="text-2xl font-bold text-purple-700">Payment QR Code</h3>
            </div>
            <div class="bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 rounded-3xl p-8 inline-block relative">
              <div class="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full"></div>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full"></div>
              <div class="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full"></div>
              <div class="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full"></div>
              <img 
                src="/src/lib/images/{ukm.qris_url}" 
                alt="QRIS Payment Code for {ukm.name}"
                class="max-w-xs mx-auto rounded-2xl shadow-lg border-4 border-white"
              />
            </div>
            <div class="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl border-2 border-blue-300">
              <p class="text-lg text-purple-700 font-medium mb-2">
                🎪 Scan this magical QR code to make payment for {ukm.name}
              </p>
              <p class="text-xl font-bold text-purple-800">
                💰 Amount: {ukm.regist_fee > 0 ? `Rp ${ukm.regist_fee.toLocaleString('id-ID')}` : 'Free'}
              </p>
            </div>
          </div>
        {/if}

        <!-- Payment Proof Upload -->
        {#if slug !== 'esport' && slug !== 'menwa'}
          <div class="mb-6">
            <div class="flex items-center space-x-2 mb-3">
              <div class="text-xl">📸</div>
              <label for="payment" class="block text-lg font-bold text-purple-700">
                Payment Proof <span class="text-red-500">*</span>
              </label>
            </div>
            <div class="relative">
              <input 
                type="file" 
                id="payment" 
                bind:files={paymentFile}
                accept="image/*,.pdf"
                required
                class="block w-full text-lg text-purple-900 border-3 border-purple-300 rounded-2xl cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 p-4"
              />
              <div class="absolute top-2 right-2 text-2xl">🎭</div>
            </div>
            <p class="mt-3 text-sm text-purple-600 bg-purple-50 p-3 rounded-xl border border-purple-200">
              📁 Upload proof of payment (PNG, JPG, or PDF, max 5MB)
            </p>
          </div>
        {:else}
          <div class="bg-gradient-to-r from-green-100 to-blue-100 border-3 border-green-300 rounded-2xl p-6 mb-6 relative">
            <div class="absolute top-2 right-2 text-3xl animate-bounce">🎉</div>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-green-800">🎁 Free Carnival Admission!</p>
                <p class="text-sm text-green-700">No payment required for {slug === 'esport' ? 'Esport' : 'MENWA'} UKM</p>
              </div>
            </div>
          </div>
        {/if}

        <!-- Google Drive URL -->
        <div class="mb-6">
          <div class="flex items-center space-x-2 mb-3">
            <div class="text-xl">🗂️</div>
            <label for="drive_url" class="block text-lg font-bold text-purple-700">
              Portfolio Link (Google Drive URL) <span class="text-gray-500 text-sm">(Optional)</span>
            </label>
          </div>
          <div class="relative">
            <input 
              type="url" 
              id="drive_url" 
              bind:value={driveUrl}
              placeholder="https://drive.google.com/..."
              class="block w-full px-4 py-4 border-3 border-purple-300 rounded-2xl text-lg bg-gradient-to-r from-purple-50 to-pink-50 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500"
            />
            <div class="absolute top-3 right-3 text-2xl">🎨</div>
          </div>
          <p class="mt-3 text-sm text-purple-600 bg-purple-50 p-3 rounded-xl border border-purple-200">
            🎪 Share a Google Drive link to your portfolio documents (optional)
          </p>
        </div>

        <!-- Submit Button -->
        <div class="pt-6">
          {#if reservationId}
            <div class="bg-gradient-to-r from-green-100 to-blue-100 border-3 border-green-400 text-green-800 px-6 py-4 rounded-2xl mb-6 relative">
              <div class="absolute top-2 right-2 text-2xl animate-pulse">✨</div>
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-xl font-bold">🎟️ Your Seat is Reserved!</p>
                  <p class="text-sm">Show starts at: {reservationExpiry?.toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          {/if}
          
          <button 
            type="submit"
            disabled={submitting}
            class="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden {submitting ? 'cursor-not-allowed' : ''}"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            <div class="relative flex items-center justify-center space-x-3">
              {#if submitting}
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>{reservationId ? '🎪 Preparing your show...' : '🎟️ Reserving your seat...'}</span>
              {:else}
                <span class="text-2xl">🎪</span>
                <span>{(slug === 'esport' || slug === 'menwa') ? 'Join the Free Show!' : 'Reserve My Spot & Join!'}</span>
                <span class="text-2xl">🎭</span>
              {/if}
            </div>
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
  }
  
  /* Timer animation */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  .timer-warning {
    animation: pulse 2s infinite;
  }
  
  /* Timer styles */
  .timer-progress {
    transition: width 1s linear;
  }
  
  .timer-text {
    font-family: 'Courier New', monospace;
    font-variant-numeric: tabular-nums;
  }

  /* Carnival theme enhancements */
  .border-3 {
    border-width: 3px;
  }
  
  .container {
    max-width: 800px;
  }
</style>

