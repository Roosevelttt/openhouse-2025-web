<script lang="ts">
  import { PUBLIC_API_BASE } from '$env/static/public';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Swal from "sweetalert2";

  function login() {
    const base = PUBLIC_API_BASE || '';
    const redirect = $page.url.searchParams.get('redirect') || '/';
    const error = $page.url.searchParams.get('error');
    
    // Store redirect destination for after login
    if (redirect !== '/') {
      sessionStorage.setItem('redirect_after_login', redirect);
    }
    
    window.location.href = `${base}/api/auth/google/start`;
  }
  
  let errorMessage = '';

  onMount(() => {
    const error = $page.url.searchParams.get('error');
    

    if (error) {

      if (error === 'admin_required') {
        errorMessage = 'Admin access required. Please login with an admin account.';
      } else if (error === 'session_error') {
        errorMessage = 'Session error. Please login again.';
      } else if (error === 'not_student') {
        errorMessage = 'Only students can login.';
      }

      Swal.fire({
        title: "Login Failed",
        text: errorMessage,
        icon: "error"
      });
    }
  });

  
</script>

<section class="w-full h-[89vh] flex items-center justify-center flex-col">
  {#if errorMessage}
    <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {errorMessage}
    </div>
  {/if}
  
  <button on:click={login} class=" flex items-center">
    <img src="http://pluspng.com/img-png/google-logo-png-open-2000.png" alt="" class="h-[50px] mr-4">
    <p class="text-2xl">Sign in with Google</p>
    
  </button>
</section>