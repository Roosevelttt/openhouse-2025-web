<script lang="ts">
  import Title from "$lib/components/ukm/Title.svelte";
  import Background from "$lib/components/ukm/Background.svelte";
  import Logo from "$lib/components/ukm/Logo.svelte";
  import { onMount } from "svelte";
  import { PUBLIC_API_BASE, PUBLIC_IMAGE_BASE } from "$env/static/public";
  import Subtitle from "$lib/components/ukm/Subtitle.svelte";
  import Video from "$lib/components/ukm/Video.svelte";
  import AOS from 'aos';
  import 'aos/dist/aos.css';''
    import { get } from "svelte/store";

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

    return `${PUBLIC_IMAGE_BASE}${relativeUrl}`.replace(/([^:]\/)\/+/g, "$1");
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

<!-- bg -->
<div class="fixed inset-0 bg-gradient-to-b from-[#2e2157] via-[#382e5f] to-[#4a2a6a] z-[-10]"></div>
<img class="fixed top-0 left-0 z-[-9]" src="/images/Stars.png" alt="">

<Background className="flex flex-col items-center justify-center text-center p-8 !overflow-visible">
  <!-- floating balloon (decorative) -->
  <img
    src="/images/balloon.png"
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
      src={getImageUrl(selectedLk?.logo_url) || "/images/default-logo.png"}
      alt="LOGO UKM"
      className="mb-2 lg:!w-1/2 "
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
      <Video src={getImageUrl(selectedLk.video_url)} className="w-full lg:w-auto h-full" controls={true} />
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
