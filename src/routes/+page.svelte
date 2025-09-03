<script>
  import Hero from '$lib/components/home/Hero.svelte';
  import UKMSection from '$lib/components/home/Ukm.svelte';
  import LKSection from '$lib/components/home/Lk.svelte';
  import Ukm from '$lib/components/home/Ukm.svelte';
</script>

<main>
  <Hero />

  <div class="relative z-0 w-[120%] max-w-none left-1/2 -translate-x-1/2">
    <img src="/svg/home/ukm/bookshelf v2.svg" alt="Bookshelf background placeholder" class="w-full" />
  </div>

  <!-- <Ukm /> -->
  <div class="-mt-3">
    <LKSection />
  </div>
</main>

<style>
  main {
    display: block;
  }
</style>