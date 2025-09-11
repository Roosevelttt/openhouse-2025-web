<svelte:head>
	<title>Open House 2025 - {selectedLk?.name || "LK"}</title>
</svelte:head>

<script lang="ts">
  import Title from "$lib/components/ukm/Title.svelte";
  import Background from "$lib/components/ukm/Background.svelte";
  import Logo from "$lib/components/ukm/Logo.svelte";
  import { onMount } from "svelte";
  import { PUBLIC_API_BASE } from "$env/static/public";
  import Subtitle from "$lib/components/ukm/Subtitle.svelte";
  import Video from "$lib/components/ukm/Video.svelte";
  import AOS from 'aos';
  import 'aos/dist/aos.css';''

  interface Lk {
    id: string;
    name: string;
    slug: string;
    current_slot: number | null;
    max_slot: number | null;
    regist_fee: number | null;
    description: string;
    logo_url: string;
    poster_url: string | null;
    groupchat: string;
    image_urls: string | null;
    video_url: string | null;
    qris_url: string | null;
  }
  
  export let data: { lk: Lk | null, error?: string };
  let selectedLk = data.lk;
  let error = data.error ?? null;

  function getImageUrl(relativeUrl: string | null): string | null {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith("http")) return relativeUrl;

    return `${PUBLIC_API_BASE}${relativeUrl}`.replace(/([^:]\/)\/+/g, "$1");
  }

  function parseImageUrls(imageUrls: string | null): string[] {
    if (!imageUrls) return [];
    try {
      return JSON.parse(imageUrls);
    } catch {
      return [];
    }
  }

  let galleryImages: string[] = [];
  let logoUrl: string | null = null;
  let posterUrl: string | null = null;
  let posterOverlay: HTMLElement | null = null;
 
  import { goto } from '$app/navigation';
  function goBack() {
    history.length > 1 ? history.back() : goto('/'); 
  }

  onMount(() => {
    AOS.init();
    if (selectedLk) {
      galleryImages = parseImageUrls(selectedLk.image_urls)
        .map(getImageUrl)
        .filter((img): img is string => !!img);
      logoUrl = getImageUrl(selectedLk.logo_url);
      console.log(logoUrl);
      if (selectedLk.poster_url) {
        posterUrl = getImageUrl(selectedLk.poster_url);
      }
    }
    
    if (posterOverlay) {
      gsap.to(posterOverlay, {
        opacity: 0.5,
        pointerEvents: "auto",
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: posterOverlay,   
          start: "95% bottom",       
          toggleActions: "play none none reverse", 
        },
      });
    }
  });
</script>
<section class="overflow-x-hidden relative min-h-screen">
  <div class="absolute inset-0 w-full min-h-full">
    <img
      src="/background/pink sky v3.webp"
      alt="Purple sky background"
      class="absolute inset-0 w-full h-full min-h-screen object-cover z-[-1]"
    />
  </div>

  <button 
    on:click={goBack}
    class="fixed flex items-center top-4 left-4 z-50 px-4 py-2 rounded-xl shadow-lg 
          bg-[#fde394] text-[#382e5f] font-semibold 
          hover:bg-[#fcd34d] hover:scale-105 transition-transform duration-200"
  >
    <svg xmlns="http://www.w3.org/2000/svg" 
        class="w-5 h-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
    <span class="font-semibold text-[#382e5f]">Back</span>
  </button>

{#if selectedLk}
  <Background className="flex flex-col items-center justify-center text-center p-8 !overflow-visible space-y-5">
    <!-- floating balloon (decorative) -->
    <img
      src="/lk/balloon.webp"
      alt="balloon"
      class="absolute -bottom-[10%] md:bottom-0 -left-[15%] md:left-5 w-20 w-[200px] md:w-[250px] animate-bounce-slow opacity-70"
    />
    <img
      src="/images/fireworks-1.png"
      alt="fireworks"
      class="absolute mix-blend-color-dodge -top-[5%] md:top-0 -right-[15%] md:right-0 w-[250px] md:w-[300px] animate-bounce-slow opacity-70"
    />

    <div data-aos="zoom-in" data-aos-delay="100">
      <Logo
        src={getImageUrl(selectedLk?.logo_url)}
        alt="LOGO UKM"
        className=""
        aos="zoom-out"
      />
    </div>

    <div data-aos="fade-down" data-aos-delay="200">
      <Title text={selectedLk?.name} className={'text-[var(--color-light-gold)]'} />
    </div>
  </Background>

  <!-- Description -->
  <Background className="relative flex flex-col items-center justify-center p-8 !overflow-visible">
    <img class="hidden md:block absolute md:-top-[10%] lg:top-0 left-0 z-[-9] opacity-70" src="/images/clouds.png" alt="">

    <div data-aos="fade-down">
      <Title text={'About Us'} className={'text-[var(--color-light-gold)]'} />
    </div>

    <div data-aos="zoom-in" data-aos-delay="200">
      <Subtitle
        text={selectedLk?.description}
        className="leading-relaxed text-sm sm:text-base md:text-lg max-w-3xl mx-auto p-4 sm:p-6 my-6 sm:my-12 rounded-2xl bg-white/10 backdrop-blur-md border border-[#fde394]/40 text-[#fdfdfd] shadow-lg"
      />
    </div>
  </Background>

  <!-- Gallery -->
  {#if galleryImages.length > 0}
    <Background className="flex flex-col items-center justify-center p-8 gap-20 !overflow-visible">
      <img
        src="/images/fireworks-2.png"
        alt="fireworks" data-aos="zoom-in"
        class="absolute mix-blend-color-dodge lg:hidden -top-[5%] md:top-0 -left-[15%] md:left-0 w-[300px] opacity-70"
      />

      <img
        src="/images/fireworks-3.png"
        alt="fireworks" data-aos="zoom-in"
        class="absolute mix-blend-color-dodge lg:hidden -bottom-[10%] md:bottom-0 -right-[15%] md:right-5 w-20 w-[300px] opacity-50"
      />
      
      <div data-aos="fade-down">
        <Title text="Our Journey✨" className={'text-[var(--color-light-gold)]'} />
      </div>
      <div class="grid w-[90%] md:w-3/4 grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {#each galleryImages as img, i}
          <div data-aos="zoom-in" data-aos-delay={i * 100}>
            <div class="overflow-hidden rounded-xl shadow-lg transition-transform duration-200 ease-in-out hover:scale-105">
              <img src={img} alt="gallery" class="w-full object-cover aspect-3/2" />
            </div>
          </div>
        {/each}
      </div>
    </Background>
  {/if}

  <!-- Video -->
  {#if selectedLk?.video_url}
    <Background className="flex flex-col items-center justify-center p-8 gap-5">
      <div data-aos="fade-down">
        <Title text="Watch Our Story 🎥" />
      </div>
      <div data-aos="fade-up" data-aos-delay="200" data-aos-duration="500">
        <Video videoSrc={selectedLk.video_url} className="w-full lg:w-auto h-full" controls={true} />
      </div>
    </Background>
  {/if}

  <!-- Poster -->
  {#if selectedLk?.poster_url}
    <Background
      className="p-8 sm:p-16 lg:p-20 flex flex-col items-center justify-center gap-5"
    >
      <div
        class="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-[-1] opacity-15"
        bind:this={posterOverlay}
      ></div>
      <Title text="Join Us!"></Title>
      <img
        src={PUBLIC_API_BASE}{selectedLk.poster_url}
        alt="poster"
        class="w-full md:w-1/2 rounded-xl shadow-lg"
      />
    </Background>
  {/if}
{:else if !error}
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <Title text="Loading..." />
  </div>
{:else}
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <Title text="LK not found" />
    <Subtitle text="Sorry, the LK you are looking for does not exist or is unavailable." />
  </div>
{/if}
</section>

<style>
  .animate-bounce-slow {
    animation: bounce 6s infinite;
  }
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
</style>
