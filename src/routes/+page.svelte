<script>
  import Hero from '$lib/components/home/Hero.svelte'; 
  import LKSection from '$lib/components/home/Lk.svelte';
  import UKM from '$lib/components/home/UKM.svelte';
  import Swal from '$lib/components/swal/swal.svelte'
</script>

<Swal />

<Swal />

<main class="relative overflow-x-hidden">
  <Hero />
  <div class="relative z-10">
    <LKSection />
  </div>

  <div class="relative z-20 h-screen sticky top-0 -mt-[100vh]">
    <UKM />
  </div>

</main>

<style>
  main {
    display: block;
  }
</style>