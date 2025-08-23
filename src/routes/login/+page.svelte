<script lang="ts">
  import { PUBLIC_API_BASE } from '$env/static/public';
  import { onMount } from 'svelte';

  function login() {
    const base = PUBLIC_API_BASE || '';
    window.location.href = `${base}/api/auth/google/start`;
  }
</script>

<section class="w-full h-[89vh] flex items-center justify-center">
  <button on:click={login} class=" flex items-center">
    <img src="http://pluspng.com/img-png/google-logo-png-open-2000.png" alt="" class="h-[50px] mr-4">
    <p class="text-2xl">Sign in with Google</p>
    
  </button>
</section>