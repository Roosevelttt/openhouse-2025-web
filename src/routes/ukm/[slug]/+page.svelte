<svelte:head>
	<title>Open House 2025 - {selectedUkm?.name || "UKM"}</title>
</svelte:head>

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
  import { PUBLIC_API_BASE} from "$env/static/public";
  import { onMount, tick } from "svelte";
  import { goto } from '$app/navigation';
  import { checkUserReservation } from "$lib/api";
  import { assetLoadingPromises, loadImage } from '$lib/asset-loader';


  function goBack() {
    history.length > 1 ? history.back() : goto('/'); 
  }

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

  let logoRef: any = null;
  let titleRef: any = null;
  let introRef: any = null;
  let overlayRef: any = null;
  let containerRef: any = null;

  let part1Ref: any = null;

  let posterOverlay: any = null;
  
  // Component references
  let backgroundRef: any = null;
  let logoComponentRef: any = null;
  let titleComponentRef: any = null;

  let hasRegistered = false;
  let loadingReservation = true;

  const bg = '/background/table-bg.webp';

  onMount(async () => {
    loadingReservation = true;
    const ukmId = selectedUkm?.id;
    if (ukmId) {
      try {
        const res = await checkUserReservation(ukmId);
        hasRegistered = res.has_reservation;
      } catch (e) {
        hasRegistered = false;
      }
    }
    loadingReservation = false;

    if (selectedUkm) {
      const imageUrls = [
        bg,
        getImageUrl(selectedUkm.logo_url),
        getImageUrl(selectedUkm.poster_url),
        ...parseImageUrls(selectedUkm.image_urls).map(url => getImageUrl(url)),
        '/images/ukm/mask.png',
        '/images/ukm/multi-card.png'
      ];

      const promises = imageUrls.map(loadImage);
      assetLoadingPromises.set(promises);
    }

    await tick();
    AOS.init();

    const { default: gsap } = await import("gsap");
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);

    if (overlayRef && logoRef && titleRef && introRef && containerRef && part1Ref) {
      // Intro overlay fade
      gsap.to(overlayRef, { opacity: 0.7, duration: 0 });
      gsap.to(overlayRef, { opacity: 0, duration: 1.2, delay: 0.5 });
      
      // Entrance animation
      gsap.from(logoRef, {x: -200, opacity: 0, duration: 1, delay: 1.2, ease: "power2.out"});
      gsap.from(titleRef, {opacity: 0, y: 30, duration: 1, delay: 1.5, ease: "power2.out"});

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
    if (!selectedUkm) return false;
    return (
      selectedUkm.max_slot !== null &&
      selectedUkm.current_slot !== null &&
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

{#if selectedUkm}
  <!-- bg -->
  <div class="fixed top-0 left-0 w-full h-[100lvh] bg-cover bg-center bg-no-repeat -z-10"
    style="background-image: url({bg});">
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


  <Background ref={(el: any) => (containerRef = el)} className="relative flex flex-col justify-center items-center p-8 sm:p-16 lg:p-20" >
    <div class="absolute inset-0 bg-black opacity-0" bind:this={overlayRef}></div>

    <div class="relative flex flex-col items-center justify-center space-y-5" bind:this={part1Ref}>
      <Logo
        src="{getImageUrl(selectedUkm?.logo_url) || 'default-logo.png'}"
        alt="LOGO UKM"
        className={`mb-4 ${selectedUkm?.slug === "orkestra" ? "!bg-black" : "bg-white"}`}
        ref={(el: any) => (logoRef = el)}
      />
      <Title text="{selectedUkm?.name}" ref={(el:any) => (titleRef = el)} />

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

  <Background 
    className="relative h-[150vh] md:h-screen flex flex-col items-center justify-center space-y-12 p-8 overflow-x-hidden overflow-y-visible"
  >
    <div data-aos="fade-down">
      <Title text="Our Journey✨" />
    </div>

    <!-- Mobile -->
    <div class="md:hidden relative h-full w-full">
      {#each parseImageUrls(selectedUkm?.image_urls) as url, i}
        <ImageFrame
          src={getImageUrl(url)}
          alt={`Dekorasi ${i + 1}`}
          className={mobileImageStyles[i] ?? mobileImageStyles[0]}
        />
      {/each}
    </div>

    <!-- Desktop -->
    {#if parseImageUrls(selectedUkm?.image_urls).length === 3}
      <div class="hidden lg:grid lg:grid-cols-3 gap-2 justify-center mx-auto lg:w-[80%] h-full">
        {#each parseImageUrls(selectedUkm?.image_urls) as url, i}
          <ImageFrame
            src={getImageUrl(url)}
            alt={`Dekorasi ${i + 1}`}
            className={desktopImage[i] ?? desktopImage[0]}
          />
        {/each}
      </div>
    {:else}
      <div class="hidden relative md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 justify-center w-[90%] h-full mx-auto">
        {#each parseImageUrls(selectedUkm?.image_urls) as url, i}
          <ImageFrame
            src={getImageUrl(url)}
            alt={`Dekorasi ${i + 1}`}
            className={desktopImageStyles[i] ?? desktopImageStyles[0]}
          />
        {/each}
      </div>
    {/if}
    <img 
      class="w-[325px] lg:w-[375px] absolute lg:top-[50%] -bottom-[10%] md:-bottom-[20%] md:-left-[10%] lg:left-0 z-[100] rotate-45 lg:rotate-10" 
      src="/images/ukm/mask.png" 
      alt=""
    />
    <img 
      class="w-[325px] max-md:hidden lg:w-[375px] absolute -bottom-[15%] -right-[5%] -rotate-90 z-[1]" 
      src="/images/ukm/multi-card.png" 
      alt=""
    />
  </Background>

  {#if selectedUkm?.video_url}
    <Background className="relative flex flex-col items-center justify-center p-8 gap-5">
      <div data-aos="fade-down">
        <Title text="Watch Our Story🎥" />
      </div>
      <Video videoSrc={selectedUkm.video_url} controls={true} />
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
            <Poster url={getImageUrl(selectedUkm.poster_url)} />
          </div>
          <div data-aos="zoom-in" data-aos-delay="300" class="w-[80%] md:w-3/4 md:mx-auto flex flex-col items-center text-center space-y-1 md:space-y-3 lg:space-y-5 
                  bg-[#fff8e1]/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-4 border-red-500">
            {#if !isUkmWebsite()}
              <Subtitle text="🎟 Current Slot: {selectedUkm.current_slot == null ? '0' : selectedUkm.current_slot}/{selectedUkm.max_slot}" 
                className="font-extrabold text-xl md:text-2xl lg:text-3xl text-red-600 drop-shadow-sm" />
              <Subtitle text="Registration Fee: {selectedUkm.regist_fee ? formatFee(selectedUkm.regist_fee) : 'Free'}" 
                className="font-extrabold text-xl md:text-2xl lg:text-3xl text-yellow-600 drop-shadow-sm" />
            {:else}
              <Subtitle text="Click the button below to visit our official website for more information and registration." 
                className="font-extrabold text-xl md:text-2xl lg:text-3xl text-yellow-600 drop-shadow-sm" />
            {/if}
            <button 
              on:click={handleRegisterClick}
              class="btn push relative px-4 py-2 rounded-[8px] font-bold cursor-pointer overflow-hidden transition-all
                    transition-duration-300 text-white bg-[#333] text-centerfont-lexend mt-4 md:px-8 md:py-3 text-lg md:text-xl"
              disabled={!isUkmWebsite() && (isSlotFull() || hasRegistered) || loadingReservation}
            >
              {#if loadingReservation}
                Checking...
              {:else if isUkmWebsite()}
                Visit Website
              {:else}
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
        <div data-aos="zoom-in" data-aos-delay="300" class="w-[80%] md:w-3/4 lg:w-1/2 md:mx-auto flex flex-col items-center text-center space-y-1 md:space-y-3 lg:space-y-5 
            bg-[#fff8e1]/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-4 border-red-500">
          {#if !isUkmWebsite()}
            <Subtitle text="🎟 Current Slot: {selectedUkm.current_slot == null ? '0' : selectedUkm.current_slot}/{selectedUkm.max_slot}" 
              className="font-extrabold text-xl md:text-2xl lg:text-3xl text-red-600 drop-shadow-sm" />
            <Subtitle text="Registration Fee: {selectedUkm.regist_fee ? formatFee(selectedUkm.regist_fee) : 'Free'}" 
              className="font-extrabold text-xl md:text-2xl lg:text-3xl text-yellow-600 drop-shadow-sm" />
          {:else}
            <Subtitle text="Click the button below to visit our official website for more information and registration." 
              className="font-extrabold text-xl md:text-2xl lg:text-3xl text-yellow-600 drop-shadow-sm" />
          {/if}
          <button 
            on:click={handleRegisterClick}
            class="btn push relative px-4 py-2 rounded-[8px] font-bold cursor-pointer overflow-hidden transition-all
                  transition-duration-300 text-white bg-[#333] text-centerfont-lexend mt-4 md:px-8 md:py-3 text-lg md:text-xl"
            disabled={!isUkmWebsite() && (isSlotFull() || hasRegistered) || loadingReservation}
          >
            {#if isUkmWebsite()}
              Visit Website
            {:else}
              {hasRegistered? "Already Registered 🙅‍♂️"
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
{:else}
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <Title text="UKM not found" />
    <Subtitle text="Sorry, the UKM you are looking for does not exist or is unavailable." />
  </div>
{/if}
