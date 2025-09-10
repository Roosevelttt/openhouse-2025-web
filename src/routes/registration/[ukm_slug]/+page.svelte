<script lang="ts">
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import { get, post, getCurrentUserInfo, getUserBiodata, reserveSlot, registerWithReservation, checkUserReservation } from '$lib/api';
  import { goto } from '$app/navigation';
  import Swal from "sweetalert2";
  import CarnivalTable from '$lib/components/background/CarnivalTable.svelte';

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
      
      // Show expiry message with carnival theme
      Swal.fire({
        icon: 'warning',
        title: 'Time\'s Up!',
        html: `
          <div class="text-center">
            <p class="text-lg mb-3">Your slot reservation has expired!</p>
            <p class="text-orange-600">The show must go on, but your seat is no longer reserved.</p>
            <p class="text-sm text-gray-600 mt-3">Please try again to get a new reservation.</p>
          </div>
        `,
        confirmButtonText: 'Go to homepage',
        confirmButtonColor: '#ea580c',
        allowOutsideClick: false,
        customClass: {
          popup: 'rounded-3xl border-4 border-orange-300',
          title: 'text-orange-800 font-bold',
          confirmButton: 'rounded-full px-6 py-3 font-bold'
        }
      }).then(() => {
        goto('/');
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
        loading = false;
        return;
      }

      // CRITICAL: Check if user's NRP exists in slot_reservations table
      try {
        const reservationCheck = await checkUserReservation(ukm.id);
        
        if (!reservationCheck.has_reservation) {
          // User's NRP does not exist in slot_reservations table - DENY ACCESS
          await Swal.fire({
            icon: 'error',
            title: '🚫 Access Denied',
            html: `
              <div class="text-center">
                <p class="text-lg mb-3 font-bold text-red-700">You don't have a valid slot reservation!</p>
                <p class="text-orange-600">Your NRP was not found in our reservation system.</p>
                <p class="text-sm text-white mt-3">Only users with confirmed reservations can access the payment page.</p>
              </div>
            `,
            confirmButtonText: 'Go to Homepage',
            confirmButtonColor: '#dc2626',
            allowOutsideClick: false,
            customClass: {
              popup: 'rounded-3xl border-4 border-red-300',
              title: 'text-red-800 font-bold',
              confirmButton: 'rounded-full px-6 py-3 font-bold'
            }
          });
          
          goto('/');
          return;
        }
        
        if (reservationCheck.is_expired) {
          // User has reservation but it's expired - DENY ACCESS
          await Swal.fire({
            icon: 'warning',
            title: '⏰ Reservation Expired',
            html: `
              <div class="text-center">
                <div class="text-6xl mb-4">⏰</div>
                <p class="text-lg mb-3 font-bold text-orange-700">Your reservation time has expired!</p>
                <p class="text-orange-600">Please make a new reservation to access the payment page.</p>
              </div>
            `,
            confirmButtonText: '🏠 Go to Homepage',
            confirmButtonColor: '#ea580c',
            allowOutsideClick: false,
            customClass: {
              popup: 'rounded-3xl border-4 border-orange-300',
              title: 'text-orange-800 font-bold',
              confirmButton: 'rounded-full px-6 py-3 font-bold'
            }
          });
          
          goto('/');
          return;
        }
        
        // User has valid reservation - ALLOW ACCESS
        reservationId = reservationCheck.reservation_id;
        if (reservationCheck.expires_at) {
          const parsedDate = new Date(reservationCheck.expires_at);
          if (!isNaN(parsedDate.getTime())) {
            const timeDiff = parsedDate.getTime() - new Date().getTime();
            if (timeDiff > 0) {
              reservationExpiry = parsedDate;
              startTimer();
            }
          }
        }
        
      } catch (e) {
        console.error('Error checking user reservation in database:', e);
        // If database check fails, DENY ACCESS for security
        await Swal.fire({
          icon: 'error',
          title: '🚫 System Error',
          html: `
            <div class="text-center">
              <div class="text-6xl mb-4">⚠️</div>
              <p class="text-lg mb-3">Unable to verify your reservation status.</p>
              <p class="text-orange-600">Database connection error. Please try again later.</p>
            </div>
          `,
          confirmButtonText: '🏠 Go to Homepage',
          confirmButtonColor: '#dc2626',
          allowOutsideClick: false
        });
        
        goto('/');
        return;
      }

      // Check if user has a valid reservation for this page
      if (!reservationParam || !reservationId) {
        // Also check database for any existing reservation
        try {
          const reservationCheck = await checkUserReservation(ukm.id);
          
          if (!reservationCheck.has_reservation) {
            // No reservation in URL and no reservation in database
            await Swal.fire({
              icon: 'warning',
              title: 'No Reservation Found',
              html: `
                <div class="text-center">
                  <p class="text-lg mb-3">You need a valid slot reservation to access this page.</p>
                  <p class="text-orange-600">Please reserve a slot first from the UKM list.</p>
                </div>
              `,
              confirmButtonText: 'Go to Homepage',
              confirmButtonColor: '#ea580c',
              allowOutsideClick: false,
              customClass: {
                popup: 'rounded-3xl border-4 border-orange-300',
                title: 'text-orange-800 font-bold',
                confirmButton: 'rounded-full px-6 py-3 font-bold'
              }
            });
            
            goto('/');
            return;
          } else if (reservationCheck.is_expired) {
            // Found reservation but it's expired
            await Swal.fire({
              icon: 'error',
              title: 'Reservation Expired',
              html: `
                <div class="text-center">
                  <p class="text-lg mb-3">Your slot reservation has expired.</p>
                  <p class="text-orange-600">Please reserve a new slot from the UKM.</p>
                </div>
              `,
              confirmButtonText: 'Go to Homepage',
              confirmButtonColor: '#ea580c',
              allowOutsideClick: false,
              customClass: {
                popup: 'rounded-3xl border-4 border-red-300',
                title: 'text-red-800 font-bold',
                confirmButton: 'rounded-full px-6 py-3 font-bold'
              }
            });
            
            goto('/');
            return;
          } else {
            // Found valid reservation in database, use it
            reservationId = reservationCheck.reservation_id;
            if (reservationCheck.expires_at) {
              const parsedDate = new Date(reservationCheck.expires_at);
              if (!isNaN(parsedDate.getTime())) {
                reservationExpiry = parsedDate;
                startTimer();
              }
            }
          }
        } catch (e) {
          console.error('Error checking reservation:', e);
          // If API call fails, proceed with URL-based validation
          await Swal.fire({
            icon: 'warning',
            title: 'No Reservation Found',
            html: `
              <div class="text-center">
                <p class="text-lg mb-3">You need a valid slot reservation to access this page.</p>
                <p class="text-orange-600">Please reserve a slot first from the UKM list.</p>
              </div>
            `,
            confirmButtonText: 'Go to UKM List',
            confirmButtonColor: '#ea580c',
            allowOutsideClick: false,
            customClass: {
              popup: 'rounded-3xl border-4 border-orange-300',
              title: 'text-orange-800 font-bold',
              confirmButton: 'rounded-full px-6 py-3 font-bold'
            }
          });
          
          goto('/');
          return;
        }
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
      goto('/');
      return;
    }

    // Skip payment file validation for esport and menwa
    const isFreeUkm = slug === 'esports' || slug === 'menwa';
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
      const isFreeUkm = slug === 'esports' || slug === 'menwa';
      const registrationData = {
        ukm_id: ukm.id,
        payment: isFreeUkm ? null : paymentFile[0], // Pass the actual file
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
   

  function goHomepage() {
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

  function goBack() {
    Swal.fire({
      title: 'Going Back...',
      text: 'Taking you to the previous page',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    setTimeout(() => {
      Swal.close();
      // Use browser history to go back one page
      window.history.back();
    }, 1000);
  }

</script>

<svelte:head>
	<title>Open House 2025 - Registration</title>
</svelte:head>

<div class="fixed top-0 left-0 w-full h-[100lvh] bg-[url('/images/ukm/bg-wood.png')] bg-cover bg-center bg-no-repeat -z-10"></div>
<CarnivalTable/>
  <div class="container mx-auto p-8 max-w-2xl">
    {#if loading}
    <div class="flex justify-center items-center py-16">
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-4 border-orange-300">
        <div class="flex items-center space-x-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600"></div>
          <p class="text-orange-800 font-bold text-lg">Loading...</p>
        </div>
      </div>
    </div>
  {:else if error && !ukm}
    <div class="text-center py-16">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-red-400 max-w-md mx-auto">
        <div class="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-r-xl mb-6">
          <span class="font-bold">Oops!</span> {error}
        </div>
        <button 
          on:click={goBack}
          class="bg-[var(--color-orange-dark)] hover:bg-[var(--color-orange-center)] text-white px-8 py-3 rounded-full font-plus-jakarta-sans font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Back to Previous Page
        </button>
      </div>
    </div>
  {:else if success}
    <div class="text-center py-16">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-green-400 max-w-lg mx-auto">
        <div class="flex justify-center mb-4">
          <svg class="w-16 h-16 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="bg-green-50 border-l-4 border-green-500 text-green-800 px-6 py-6 rounded-r-xl mb-6">
          <h2 class="text-2xl font-bold mb-3 text-green-700 flex items-center justify-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"/>
            </svg>
            Successful!
          </h2>
          <p class="text-lg mb-2">Your registration for <strong class="text-green-800">{ukm?.name}</strong> has been submitted successfully!</p>
          <p class="text-sm mt-3 text-green-600 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            You will receive confirmation once your payment is verified.
          </p>
          <p class="mt-4 p-3 bg-yellow-100 rounded-lg border border-orange-300 flex items-start">
            <svg class="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span><strong>Don't forget!</strong> Fill this questionnaire: 
            <a class="text-blue-600 underline hover:text-blue-800 font-medium" href="https://docs.google.com/forms/d/e/1FAIpQLScdreCQ1Uk97NQfMV8K2jRpGerpM2AcJe_qmHWMisCe0xB4tw/viewform" target="_blank">Click Here</a></span>
          </p>
        </div>
        <button 
          on:click={goHomepage}
          class="bg-[var(--color-orange-dark)] hover:bg-[var(--color-orange-center)] text-white px-8 py-3 rounded-full font-plus-jakarta-sans font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center mx-auto"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Back to Homepage
        </button>
      </div>
    </div>
  {:else if reservationId && timeRemaining <= 0}
    <!-- Reservation Expired - Block Access -->
    <div class="text-center py-16">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-red-400 max-w-lg mx-auto">
        <div class="flex justify-center mb-4">
          <svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <div class="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-6 rounded-r-xl mb-6">
          <h2 class="text-2xl font-bold mb-3 text-red-700 flex items-center justify-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Reservation Expired
            <svg class="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </h2>
          <p class="text-lg mb-2">Your slot reservation has expired and this page is no longer accessible.</p>
          <p class="text-sm mt-3 text-red-600 flex items-center justify-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Please try again by reserving a new slot from the UKM list.
          </p>
        </div>
        <button 
          on:click={() => goto('/')}
          class="bg-[var(--color-orange-dark)] hover:bg-[var(--color-orange-center)] text-white px-8 py-3 rounded-full font-plus-jakarta-sans font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center mx-auto"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          Back to Homepage
        </button>
      </div>
    </div>
  {:else if ukm}
    <!-- UKM Info Header -->
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-orange-300 p-8 mb-8 relative overflow-hidden">
      <!-- Carnival Header Decoration -->
      
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-plus-jakarta-sans font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            {ukm.name}
          </h1>
        </div>
        <button 
          on:click={goBack}
          class="text-orange-600 hover:text-orange-800 text-sm underline font-plus-jakarta-sans font-medium bg-white/50 px-3 py-1 rounded-full"
        >
          ← Back to Previous Page
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
        <div class="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-2xl border-2 border-orange-300 relative">
          <p class="text-sm text-orange-700 font-plus-jakarta-sans font-medium mb-2">Registration Fee</p>
          <p class="text-2xl font-plus-jakarta-sans font-bold text-orange-800">
            {ukm.regist_fee > 0 ? `Rp ${ukm.regist_fee.toLocaleString('id-ID')}` : 'Free!'}
          </p>
        </div>
        <div class="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-2xl border-2 border-orange-300 relative">
          <p class="text-sm text-orange-700 font-plus-jakarta-sans font-medium mb-2">Available Slots</p>
          <p class="text-2xl font-plus-jakarta-sans font-bold text-orange-800">{ukm.max_slot - ukm.current_slot} left</p>
        </div>
      </div>  
    </div>

    <!-- User Info Section -->
    {#if userName && userNrp}
      <div class="bg-white/90 backdrop-blur-sm border-2 border-orange-300 rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <p class="text-lg font-plus-jakarta-sans font-bold text-orange-800">
              <span class="text-orange-600">Name:</span> {userName}
            </p>
            <p class="text-sm text-orange-600 font-plus-jakarta-sans font-medium">NRP: {userNrp}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Reservation Timer Section -->
    {#if reservationId && timeRemaining > 0}
      <div class="bg-gradient-to-r from-yellow-100 to-orange-100 border-3 border-orange-300 rounded-3xl p-6 mb-6 relative overflow-hidden {timeRemaining <= 60 ? 'timer-warning animate-pulse' : ''}"> 
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div>
              <p class="text-lg font-plus-jakarta-sans font-bold text-orange-800">
                  Your seat is reserved! Complete payment within:
              </p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-plus-jakarta-sans font-bold timer-text bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent {timeRemaining <= 60 ? 'animate-bounce' : ''}">
              {formattedTime}
            </div>
            <p class="text-sm text-orange-700 font-plus-jakarta-sans font-medium">minutes remaining</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="w-full bg-yellow-200 rounded-full h-4 border-2 border-orange-300">
            <div 
              class="timer-progress h-full rounded-full transition-all duration-1000 ease-linear {timeRemaining <= 60 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}" 
              style="width: {(timeRemaining / 300) * 100}%"
            ></div>
          </div>
        </div>
        {#if timeRemaining <= 60}
          <div class="mt-4 p-3 bg-orange-100 border-l-4 border-orange-500 rounded-r-xl">
            <p class="text-sm text-orange-700 font-plus-jakarta-sans font-bold animate-pulse flex items-center">
              Last call! Less than 1 minute remaining! Submit your registration now to secure your spot in the show!
            </p>
          </div>
        {/if}
      </div>
    {:else if reservationId && timeRemaining <= 0}
      <div class="bg-gradient-to-r from-red-100 to-pink-100 border-3 border-red-400 rounded-3xl p-6 mb-6 relative">
        <div class="absolute top-2 right-2">
          <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>
        </div>
        <div class="flex items-center space-x-4">
          <div class="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div>
            <p class="text-lg font-plus-jakarta-sans font-bold text-orange-800">
              <svg class="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Show Has Started Without You!
            </p>
            <p class="text-sm text-orange-600 font-plus-jakarta-sans">Your reservation has expired. Please try again to get a new seat!</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Registration Form -->
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-orange-300 p-8 relative overflow-hidden">
      <div class="flex items-center space-x-3 mb-8">
        <h2 class="text-2xl font-plus-jakarta-sans font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">Requirements</h2>
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
        {#if ukm.qris_url && slug !== 'esports' && slug !== 'menwa'}
          <div class="text-center mb-8">
            <div class="flex items-center justify-center space-x-2 mb-6">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              <h3 class="text-xl font-plus-jakarta-sans font-bold text-orange-700">Payment QR Code</h3>
            </div>
            <div class="bg-gradient-to-br from-orange-100 to-orange-100 border-4 border-orange-300 rounded-3xl p-8 inline-block relative">
            
              <img 
                src="/{ukm.qris_url}" 
                alt="QRIS Payment Code for {ukm.name}"
                class="w-full max-w-xs mx-auto rounded-2xl shadow-lg border-4 border-white"
              />
            </div>
            <div class="mt-6 p-4 bg-gradient-to-r from-orange-100 to-orange-100 rounded-2xl border-2 border-orange-300">
              <p class="text-lg text-orange-700 font-plus-jakarta-sans font-medium mb-2 flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                Scan this QR code to make payment for {ukm.name}
              </p>
              <p class="text-xl font-plus-jakarta-sans font-bold text-orange-800 flex items-center justify-center">
                Amount: {ukm.regist_fee > 0 ? `Rp ${ukm.regist_fee.toLocaleString('id-ID')}` : 'Free'}
              </p>
            </div>
          </div>
        {/if}

        <!-- Payment Proof Upload -->
        {#if slug !== 'esports' && slug !== 'menwa'}
          <div class="mb-6">
            <div class="flex items-center space-x-2 mb-3">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <label for="payment" class="block text-lg font-plus-jakarta-sans font-bold text-orange-700">
                Payment Proof <span class="text-red-500">*</span>
              </label>
            </div>
            <div class="relative">
              <input 
                type="file" 
                id="payment" 
                bind:files={paymentFile}
                accept="image/*"
                required
                class="hidden"
              />
              <label 
                for="payment"
                class="block w-full text-lg text-orange-900 border-3 border-orange-300 rounded-2xl cursor-pointer bg-gradient-to-r from-orange-50 to-orange-50 hover:from-orange-100 hover:to-orange-100 focus-within:ring-4 focus-within:ring-orange-300 focus-within:border-orange-500 p-4 transition-all duration-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-400 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-plus-jakarta-sans font-bold text-orange-800 flex items-center">
                        {#if paymentFile && paymentFile.length > 0}
                          <svg class="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                          </svg>
                          {paymentFile[0].name}
                        {:else}
                          <svg class="w-4 h-4 mr-1 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                          </svg>
                          Choose Payment Proof
                        {/if}
                      </div>
                      <div class="text-sm text-orange-600 font-plus-jakarta-sans mt-1 flex items-center">
                        {#if paymentFile && paymentFile.length > 0}
                          <svg class="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          File selected - Ready to upload!
                        {:else}
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          Click to select file
                        {/if}
                      </div>
                    </div>
                  </div>
                  <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
              </label>
            </div>
            <p class="mt-3 text-sm text-orange-600 font-plus-jakarta-sans bg-orange-50 p-3 rounded-xl border border-orange-200 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              Upload proof of payment (PNG, JPG, or JPEG, max 5MB)
            </p>
          </div>
        {:else}
          <div class="bg-gradient-to-r from-orange-100 to-orange-100 border-3 border-orange-300 rounded-2xl p-6 mb-6 relative">
            <div class="absolute top-2 right-2 animate-bounce">
              <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-lg font-plus-jakarta-sans font-bold text-orange-800 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                  </svg>
                  Free Admission!
                </p>
                <p class="text-sm text-orange-700 font-plus-jakarta-sans">No payment required for {slug === 'esports' ? 'Esport' : 'MENWA'} UKM</p>
              </div>
            </div>
          </div>
        {/if}

        <!-- Google Drive URL -->
        <div class="mb-6">
          <div class="flex items-center space-x-2 mb-3">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            <label for="drive_url" class="block text-lg font-plus-jakarta-sans font-bold text-orange-700">
              Portfolio Link (Google Drive URL) <span class="text-gray-500 text-sm">(Optional)</span>
            </label>
          </div>
          <div class="relative">
            <input 
              type="url" 
              id="drive_url" 
              bind:value={driveUrl}
              placeholder="https://drive.google.com/..."
              class="block w-full px-4 py-4 border-3 border-orange-300 rounded-2xl text-lg font-plus-jakarta-sans bg-gradient-to-r from-orange-50 to-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-500"
            />
          </div>
          <p class="mt-3 text-sm text-orange-600 font-plus-jakarta-sans bg-orange-50 p-3 rounded-xl border border-orange-200">
            Share a Google Drive link to your portfolio documents
          </p>
        </div>

        <!-- Submit Button -->
        <div class="pt-6">
          
          <button 
            type="submit"
            disabled={submitting}
            class="w-full bg-[var(--color-orange-dark)] hover:bg-[var(--color-orange-center)] disabled:from-gray-400 disabled:to-gray-500 text-white font-plus-jakarta-sans font-bold py-4 px-8 rounded-2xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden {submitting ? 'cursor-not-allowed' : ''}"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            <div class="relative flex items-center justify-center space-x-3">
              {#if submitting}
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span class="font-plus-jakarta-sans">{reservationId ? 'Submitting...' : 'Submitting...'}</span>
              {:else}
                <span class="font-plus-jakarta-sans">{(slug === 'esports' || slug === 'menwa') ? 'Join the Free Show!' : 'Reserve My Spot & Join!'}</span>
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

