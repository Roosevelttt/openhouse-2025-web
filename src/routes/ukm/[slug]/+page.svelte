<script lang="ts">
  import Background from "$lib/components/ukm/Background.svelte";
  import Logo from "$lib/components/ukm/Logo.svelte";
  import Title from "$lib/components/ukm/Title.svelte";
  import Subtitle from "$lib/components/ukm/Subtitle.svelte";
  import ImageFrame from "$lib/components/ukm/ImageFrame.svelte";
  import Video from "$lib/components/ukm/Video.svelte";
  import Poster from "$lib/components/ukm/Poster.svelte";  
  import AOS from 'aos';
  import 'aos/dist/aos.css'; 
  import { PUBLIC_API_BASE } from "$env/static/public";
  import { onMount, tick } from "svelte";
  import { goto } from '$app/navigation';
  import { checkUserReservation } from "$lib/api";

  interface Ukm {
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
  
  export let data: { ukm: Ukm | null, error?: string };
  let selectedUkm = data.ukm;
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

  function formatFee(fee: number | null): string {
    if (fee === null || fee === 0) return "Free";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(fee);
  }

  let logoRef: HTMLImageElement | null = null;
  let titleRef: HTMLHeadingElement | null = null;
  let introRef: HTMLDivElement | null = null;
  let overlayRef: HTMLDivElement | null = null;
  let containerRef: HTMLDivElement | null = null;

  let part1Ref: HTMLDivElement | null = null;
  let part2Ref: HTMLDivElement | null = null;

  let posterOverlay: HTMLDivElement | null = null;
  
  // Component references
  let backgroundRef: any = null;
  let logoComponentRef: any = null;
  let titleComponentRef: any = null;

  let hasRegistered = false;
  let loadingReservation = true;

  onMount(async () => {
    loadingReservation = true;
    const ukmId = selectedUkm?.id;
    if (ukmId) {
      try {
        const res = await checkUserReservation(ukmId);
        hasRegistered = res.has_registered;
      } catch (e) {
        hasRegistered = false;
      }
    }
    loadingReservation = false;

    await tick();
    AOS.init();

    const { default: gsap } = await import("gsap");
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);

    if (overlayRef && logoComponentRef && titleComponentRef && introRef && backgroundRef) {
      // Intro overlay fade
      gsap.to(overlayRef, { opacity: 0.7, duration: 0 });
      gsap.to(overlayRef, { opacity: 0, duration: 1.2, delay: 0.5 });
      
      // Entrance animation
      gsap.from(logoComponentRef, {x: -200, opacity: 0, duration: 1, delay: 1.2, ease: "power2.out"});
      gsap.from(titleComponentRef, {opacity: 0, y: 30, duration: 1, delay: 1.5, ease: "power2.out"});
      
      const deltaY = window.innerHeight * 0.25 - (window.innerHeight / 2);

      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: backgroundRef,
          start: "top top",
          end: "+=100",
          scrub: true,
          pin: true,
        },
      });

      tl.to(part1Ref, {
        y: deltaY,
        scale: 0.75,
      }).to(introRef, {
        maxHeight: 1000,
        duration: 1,
        y: deltaY,
        ease: "power2.out",
        onComplete: () => {
          if (introRef) {
            introRef.classList.remove("max-h-0", "overflow-hidden");
            introRef.classList.add("border", "border-white/10", "p-4");
          }
        },
        onReverseComplete: () => {
          if (introRef) {
            introRef.classList.add("max-h-0", "overflow-hidden");
            introRef.classList.remove("border", "border-white/10", "p-4");
          }
        },
      });
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

  const mobileImageStyles = [
    "absolute w-[270px] sm:w-[300px] -rotate-8 top-0 left-0 z-10", //1
    "absolute w-[270px] sm:w-[300px] rotate-8 top-[20%] right-[5%] z-10", //2
    "absolute w-[270px] sm:w-[300px] -rotate-12 top-[45%] left-[5%] z-[11]", //3
    "absolute w-[270px] sm:w-[300px] rotate-15 top-[70%] right-[2%] z-12", //4
  ];

  const desktopImageStyles = [
    "-rotate-8 w-[270px]",
    "rotate-8 translate-y-2 w-[270px]",
    "-rotate-2 translate-y-10 w-[270px]",
    "rotate-8 -translate-y-1 w-[270px]",
  ];

  const desktopImage = [
    "-rotate-8 w-[300px]",
    "rotate-8 translate-y-2 w-[300px]",
    "-rotate-2 translate-y-10 w-[300px]",
    "rotate-8 -translate-y-1 w-[300px]",
  ];

  // List of UKM slugs with their own websites
  const ukmWebsites: Record<string, string> = {
    "vg": "https://linktr.ee/PCUMusicTalentActivity?utm_source=qr_code",
    "orkestra": "https://linktr.ee/PCUMusicTalentActivity?utm_source=qr_code",
    "choir": "https://linktr.ee/PCUMusicTalentActivity?utm_source=qr_code",
  };

  function handleRegisterClick() {
    if (!selectedUkm?.slug) return;
    if (ukmWebsites[selectedUkm.slug]) {
      window.open(ukmWebsites[selectedUkm.slug], "_blank");
    } else {
      goto(`/biodata?ukm_slug=${selectedUkm.slug}`);
    }
  }

  function isSlotFull(): boolean {
    if (!selectedUkm) return false;
    return (
      selectedUkm.max_slot !== null &&
      selectedUkm.current_slot !== null &&
      selectedUkm.current_slot >= selectedUkm.max_slot
    );
  }

  function isUkmWebsite(): boolean {
    if (!selectedUkm?.slug) return false;
    return !!ukmWebsites[selectedUkm.slug];
  }
</script> 

<div class="fixed top-0 left-0 w-full h-[100lvh] bg-[url('/images/ukm/bg-wood.png')] bg-cover bg-center bg-no-repeat -z-10"></div>
<Background bind:this={backgroundRef} className="relative flex flex-col justify-center items-center p-8 sm:p-16 lg:p-20" >
  <div class="absolute inset-0 bg-black opacity-0" bind:this={overlayRef}></div>
    <!-- <img class="w-[400px] rotate-45 absolute -bottom-10 -left-5" src="images/single-card.png" alt=""> -->

  <div class="relative flex flex-col items-center justify-center space-x-2" bind:this={part1Ref}>
    <Logo
      src="{PUBLIC_API_BASE}{selectedUkm?.logo_url || 'default-logo.png'}"
      alt="LOGO UKM" 
      className="mb-4"
      bind:this={logoComponentRef}
    />
    <Title text="{selectedUkm?.name || 'UKM DEFAULT'}" bind:this={titleComponentRef} />

  </div>

  <div class="bg-gradient-to-r from-[#1a1a1a]/70 via-[#2a2a2a]/60 to-[#1a1a1a]/70 
          backdrop-blur-lg 
          shadow-lg 
          rounded-2xl 
          mt-2
          max-w-3xl 
          transition-all duration-500 ease-in-out 
          max-h-0 
          overflow-hidden"
          bind:this={introRef}
      >
    <Subtitle
      text='{selectedUkm?.description || "No description available."}'
      className="text-justify text-[#FFF4E9] max-sm:text-sm"
    />
  </div>

</Background>

<Background className="!h-[150vh] md:!h-screen flex flex-col items-center justify-center space-y-12 p-8 !overflow-visible ">
  <div data-aos="fade-down">
    <Title text="Our Journey✨"></Title>
  </div>

  <!-- Mobile -->
  <div class="md:hidden relative h-full w-full">
    {#if selectedUkm?.image_urls}
      {#each parseImageUrls(selectedUkm.image_urls) as url, i}
        <ImageFrame
          src={getImageUrl(url)}
          alt={`Dekorasi ${i + 1}`}
          className={mobileImageStyles[i] ?? mobileImageStyles[0]}
        />
      {/each}
    {/if}
  </div>

  <!-- Desktop -->
  {#if selectedUkm?.image_urls && parseImageUrls(selectedUkm.image_urls).length === 3}
    <div class="hidden lg:grid lg:grid-cols-3 gap-2 justify-center mx-auto lg:w-[80%] h-full">
      {#each parseImageUrls(selectedUkm.image_urls) as url, i}
        <ImageFrame
          src={getImageUrl(url)}
          alt={`Dekorasi ${i + 1}`}
          className={desktopImage[i] ?? desktopImage[0]}
        />
      {/each}
    </div>
  {:else if selectedUkm?.image_urls}
    <div class="hidden relative md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 justify-center w-[90%] h-full mx-auto">
      {#each parseImageUrls(selectedUkm.image_urls) as url, i}
        <ImageFrame
          src={getImageUrl(url)}
          alt={`Dekorasi ${i + 1}`}
          className={desktopImageStyles[i] ?? desktopImageStyles[0]}
        />
      {/each}
    </div>
  {/if}

  <img class="w-[325px] lg:w-[375px] absolute lg:top-[50%] -bottom-[10%] md:-bottom-[20%] md:-left-[10%] lg:left-0 z-[100] rotate-45 lg:rotate-10 " src="/images/ukm/mask.png" alt="">
  <img class="w-[325px] max-md:hidden lg:w-[375px] absolute -bottom-[15%] -right-[5%] -rotate-90 z-[1]" src="/images/ukm/multi-card.png" alt="">
</Background>


{#if selectedUkm?.video_url}
  <Background className="flex flex-col items-center justify-center p-8 gap-5">
    <div data-aos="fade-down">
      <Title text="Watch Our Story🎥" />
    </div>
    <div data-aos="fade-up" data-aos-offset="300" data-aos-duration="500">
      <Video src={getImageUrl(selectedUkm.video_url)} className="w-full lg:w-auto h-full" controls={true} />
    </div>
  </Background>
{/if}

<Background className="relative flex flex-col items-center justify-center gap-2 md:gap-1 p-8">
    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-[-1] opacity-15"
      bind:this={posterOverlay}
    ></div>
    <div data-aos="fade-down" class="w-full">
      <Title text="Join Us!" class="text-center text-3xl md:text-5xl font-bold" />
    </div>
    {#if selectedUkm?.poster_url}
      <div class="w-full flex flex-col md:grid grid-cols-2 md:gap-5 items-center">
        <div class="w-full flex justify-center mb-8 md:mb-0">
          <Poster url={PUBLIC_API_BASE}{selectedUkm.poster_url} />
        </div>
        <div data-aos="zoom-in" data-aos-offset="200" class="w-[80%] md:w-3/4 md:mx-auto flex flex-col items-center text-center space-y-1 md:space-y-3 lg:space-y-5 
                bg-[#fff8e1]/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-4 border-red-500">
          {#if selectedUkm && !isUkmWebsite()}
            <Subtitle text="🎟 Current Slot: {selectedUkm.current_slot}/{selectedUkm.max_slot}" 
              className="font-extrabold text-xl md:text-2xl lg:text-3xl text-red-600 drop-shadow-sm" />
            <Subtitle text="Registration Fee: {selectedUkm.regist_fee ? formatFee(selectedUkm.regist_fee) : 'Free'}" 
              className="font-extrabold text-xl md:text-2xl lg:text-3xl text-yellow-600 drop-shadow-sm" />
          {:else if selectedUkm && isUkmWebsite()}
            <Subtitle text="Click the button below to visit our official website for more information and registration." 
              className="font-extrabold text-xl md:text-2xl lg:text-3xl text-yellow-600 drop-shadow-sm" />
          {/if}
          <button 
            on:click={handleRegisterClick}
            class="btn push relative px-4 py-2 rounded-[8px] font-bold cursor-pointer overflow-hidden transition-all
                  transition-duration-300 text-white bg-[#333] text-centerfont-lexend mt-4 md:px-8 md:py-3 text-lg md:text-xl"
            disabled={selectedUkm && !isUkmWebsite() && (isSlotFull() || hasRegistered) || loadingReservation}
          >
            {#if loadingReservation}
              Checking...
            {:else if selectedUkm && isUkmWebsite()}
              Visit Website
            {:else if selectedUkm}
              {hasRegistered
                ? "Already Registered 🙅‍♂️"
                : isSlotFull()
                  ? "Slot Full"
                  : "Register Now!"}
            {/if}
          </button>
          {#if hasRegistered}
            <Subtitle text="You have already registered for this UKM." 
              className="font-extrabold text-lg md:text-xl text-green-600 drop-shadow-sm mt-4" />
          {/if}
        </div>
      </div>
    {:else}
      <div data-aos="zoom-in" data-aos-offset="200" class="w-[80%] md:w-3/4 lg:w-1/2 md:mx-auto flex flex-col items-center text-center space-y-1 md:space-y-3 lg:space-y-5 
          bg-[#fff8e1]/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-4 border-red-500">
        {#if selectedUkm && !isUkmWebsite()}
          <Subtitle text="🎟 Current Slot: {selectedUkm.current_slot}/{selectedUkm.max_slot}" 
            className="font-extrabold text-xl md:text-2xl lg:text-3xl text-red-600 drop-shadow-sm" />
          <Subtitle text="Registration Fee: {selectedUkm.regist_fee ? formatFee(selectedUkm.regist_fee) : 'Free'}" 
            className="font-extrabold text-xl md:text-2xl lg:text-3xl text-yellow-600 drop-shadow-sm" />
        {:else if selectedUkm && isUkmWebsite()}
          <Subtitle text="Click the button below to visit our official website for more information and registration." 
            className="font-extrabold text-xl md:text-2xl lg:text-3xl text-yellow-600 drop-shadow-sm" />
        {/if}
        <button 
          on:click={handleRegisterClick}
          class="btn push relative px-4 py-2 rounded-[8px] font-bold cursor-pointer overflow-hidden transition-all
                transition-duration-300 text-white bg-[#333] text-centerfont-lexend mt-4 md:px-8 md:py-3 text-lg md:text-xl"
          disabled={selectedUkm && !isUkmWebsite() && (isSlotFull() || hasRegistered) || loadingReservation}
        >
          {#if selectedUkm && isUkmWebsite()}
            Visit Website
          {:else if selectedUkm}
            {hasRegistered
              ? "Already Registered 🙅‍♂️"
              : isSlotFull()
                ? "Slot Full!"
                : "Register Now!"}
          {/if}
        </button>

        {#if hasRegistered}
          <Subtitle text="You have already registered for this UKM." 
            className="font-extrabold text-lg md:text-xl text-green-600 drop-shadow-sm mt-4" />
        {/if}
      </div>
    {/if}

  </Background>
