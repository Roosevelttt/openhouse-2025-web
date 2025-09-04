<script lang="ts">
  import { PUBLIC_API_BASE } from '$env/static/public';
  import { page } from '$app/stores';
  import Swal from '$lib/components/swal/swal.svelte';
  import CarnivalTableBg from '$lib/components/background/CarnivalTable.svelte';

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

  // onMount(() => {
  //   const error = $page.url.searchParams.get('error');
    

  //   if (error) {

  //     if (error === 'admin_required') {
  //       errorMessage = 'Admin access required. Please login with an admin account.';
  //     } else if (error === 'session_error') {
  //       errorMessage = 'Session error. Please login again.';
  //     } else if (error === 'not_student') {
  //       errorMessage = 'Only students can login.';
  //     }

  //     Swal.fire({
  //       title: "Login Failed",
  //       text: errorMessage,
  //       icon: "error"
  //     });
  //   }
  // });

  
</script>

<Swal />

<CarnivalTableBg class="min-h-screen !w-screen flex items-center justify-center z-30">  

<section class="z-[999] min-h-screen flex items-center justify-center flex-col relative">

  <!-- {#if errorMessage}
    <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {errorMessage}
    </div>
  {/if} -->
  
  <button on:click={login} class="drop-shadow-lg font-[family-name:Lexend] hover:bg-[var(--color-orange-center)] bg-[var(--color-orange-dark)] hover:cursor-pointer flex items-center py-3 px-5 rounded-full">
    <img src="http://pluspng.com/img-png/google-logo-png-open-2000.png" alt="" class="h-[50px] mr-4">
    <p class="text-2xl text-[var(--text-primary)]">Sign in with Google</p>
    
  </button>
  <p class="mt-2 font-[family-name:Lexend] text-[var(--text-primary)]">* use your JOHN email</p>
</section>

</CarnivalTableBg>  