<script>
import Hero from '$lib/components/home/Hero.svelte'; 
import HeroB from '$lib/components/home/HeroB.svelte';
import LKSection from '$lib/components/home/Lk.svelte';
import UKM from '$lib/components/home/UKM.svelte';
import ColorPalette from '$lib/components/home/ColorPalette.svelte';
import CarnivalTable from '$lib/components/background/CarnivalTable.svelte';
import UkmSection from '$lib/components/home/UKMSection.svelte';
import Faq from '$lib/components/home/Faq.svelte';
import Swal from '$lib/components/swal/swal.svelte';
</script>

<Swal />

<main class="relative overflow-x-hidden">
  <!-- <Hero /> -->
  <HeroB />
  <UkmSection />
  <div class="relative z-10">
    <LKSection />
  </div>
  <div class="z-20 h-screen sticky top-0 -mt-[100vh]">
      <Faq />
  </div>
  <!-- <div class="relative z-20 h-screen sticky top-0 -mt-[100vh]">
    <img 
      src="/svg/home/ukm/table top.svg" 
      alt="Table Top Decoration" 
      class="w-full object-cover flex-shrink-0 z-30"
    />
    <div class="flex-grow overflow-hidden">
      <UKM />
    </div> 
  </div> -->

  <!-- <ColorPalette /> -->

</main>

<style>
  main {
    display: block;
  }
</style>