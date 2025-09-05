<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  // let ScrollTrigger: any;
  let leftCurtainFront: HTMLElement;
  let leftCurtainMiddle: HTMLElement;
  let rightCurtainFront: HTMLElement;
  let rightCurtainMiddle: HTMLElement;
  let topBanner: HTMLElement;
  let topCurtain: HTMLElement;
  let behindBanner: HTMLElement;
  let behindCurtains: HTMLElement;
  let heroTitle: HTMLElement;
  let heroTitleMobile: HTMLElement; 
  let heroSection: HTMLElement;

  let isMobile = false;

  onMount(() => {
    let ScrollTrigger: any;
    const setupScrollTrigger = async () => {
      const { ScrollTrigger: ST } = await import('gsap/ScrollTrigger');
      ScrollTrigger = ST;
      gsap.registerPlugin(ScrollTrigger);
      
      setupScrollAnimations();
    };

    const setupScrollAnimations = () => {
      
      gsap.to(rightCurtainFront, {
        xPercent: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      });

      gsap.to(rightCurtainMiddle, {
        xPercent: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1.2
        }
      });

      gsap.to(leftCurtainFront, {
        xPercent: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      });

      gsap.to(leftCurtainMiddle, {
        xPercent: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1.2
        }
      });

      gsap.to(topBanner, {
        yPercent: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1.1
        }
      });

      gsap.to(topCurtain, {
        yPercent: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1.3
        }
      });

      gsap.to(behindBanner, {
        yPercent: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1.2
        }
      });

      gsap.to(behindCurtains, {
        yPercent: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 0.8
        }
      });

      gsap.to(heroTitle, {
        opacity: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "center top",
          scrub: 1
        }
      });
    };

    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const openingTl = gsap.timeline({
      delay: 0.1,
    });

    const rightFrontMove = isMobile ? 20 : 55;
    const rightMiddleMove = isMobile ? 20 : 55;
    const leftFrontMove = isMobile ? -20 : -55;
    const leftMiddleMove = isMobile ? -20 : -55;
    const topBannerMove = isMobile ? -42 : -40;
    const topCurtainMove = isMobile ? -45 : -30;
    const behindBannerMove = isMobile ? -160 : -110;
    const behindCurtainsMove = isMobile ? -200 : -120;

    openingTl.to(rightCurtainFront, { xPercent: rightFrontMove, duration: 2, ease: 'power3.inOut' }, 0);
    openingTl.to(rightCurtainMiddle, { xPercent: rightMiddleMove, duration: 2.2, ease: 'power3.inOut' }, 0);
    openingTl.to(leftCurtainFront, { xPercent: leftFrontMove, duration: 2, ease: 'power3.inOut' }, 0);
    openingTl.to(leftCurtainMiddle, { xPercent: leftMiddleMove, duration: 2.2, ease: 'power3.inOut' }, 0);
    openingTl.to(topBanner, { yPercent: topBannerMove, duration: 2.2, ease: 'power3.inOut' }, 0);
    openingTl.to(topCurtain, { yPercent: topCurtainMove, duration: 2.4, ease: 'power3.inOut' }, 0);
    openingTl.to(behindBanner, { yPercent: behindBannerMove, duration: 2.3, ease: 'power3.inOut' }, 0);
    openingTl.to(behindCurtains, { yPercent: behindCurtainsMove, duration: 1.8, ease: 'power3.inOut' }, 0);
      openingTl.to([heroTitle, heroTitleMobile], { opacity: 1, duration: 1.5 }, 1);

    openingTl.call(() => {
      setupScrollTrigger();
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
      }
    };
  });
</script>

<section 
  bind:this={heroSection}
  class="relative flex justify-center items-center text-white text-center overflow-hidden
         h-screen max-w-none md:max-h-none"
>
  <div class="absolute inset-0 w-full h-full">
    <video playsinline autoplay muted loop poster="poster.jpg" class="w-full h-full object-cover">
      <source src="/videos/Video Chess.mp4" type="video/mp4" />
    </video>
  </div>

  <div
    bind:this={heroTitle}
    class="relative z-0 font-moomello opacity-0 drop-shadow-[0_10px_30px_rgba(96,0,0,0.25)]
          text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[12rem] xl:text-[16rem]
          bg-gradient-to-tr from-[#F6BABC] via-[#FEF7EB] to-white bg-clip-text text-transparent
          px-4 hidden sm:block" >
    <h1>OPENHOUSE</h1>
  </div>

  <div
    bind:this={heroTitleMobile}
    class="relative z-0 font-moomello opacity-0 drop-shadow-[0_10px_30px_rgba(96,0,0,0.25)]
          bg-gradient-to-tr from-[#F6BABC] via-[#FEF7EB] to-white bg-clip-text text-transparent
          px-4 block sm:hidden text-[7rem] translate-y-42" >
    <h1>OPENHOUSE</h1>
  </div>

  <div class="absolute inset-0 w-full h-full">
    <img src="/svg/home/hero/stage bottom v2.svg" alt="Stage bottom" 
         class="absolute -bottom-25 left-1/2 -translate-x-1/2 
                max-w-none w-[300%] sm:w-[130%] md:w-[120%] z-[60]" />

    <img bind:this={behindCurtains} src="/svg/home/hero/curtains behind.svg" alt="Behind curtains" 
         class="absolute bottom-0 left-1/2 -translate-x-1/2 
                max-w-none w-[180%] sm:w-[75%] md:w-[68%] z-10" />
    
    <img bind:this={behindBanner} src="/svg/home/hero/stage banner - behind.svg" alt="Stage banner background" 
         class="absolute top-70 sm:top-6 md:top-8 inset-x-0 mx-auto 
                max-w-none w-[45%] sm:w-[18%] md:w-[16%] z-20" />

    <img bind:this={leftCurtainMiddle} src="/svg/home/hero/curtain left - middle (2).svg" alt="Left curtain middle layer" 
         class="absolute max-w-none w-[200%] sm:w-[47%] md:w-[44%] -top-2 
                -left-120 sm:left-20 md:left-22 z-40" />
    
    <img bind:this={leftCurtainFront} src="/svg/home/hero/curtain left - front (2).svg" alt="Left curtain front layer" 
         class="absolute max-w-none w-[180%] sm:w-[45%] md:w-[42%] top-0 
                -left-120 sm:left-0 md:-left-5 z-50" />

    <img bind:this={rightCurtainMiddle} src="/svg/home/hero/curtain right - middle (2).svg" alt="Right curtain middle layer" 
         class="absolute max-w-none w-[200%] sm:w-[47%] md:w-[44%] -top-2
                -right-120 sm:right-20 md:right-22 z-40" />
    
    <img bind:this={rightCurtainFront} src="/svg/home/hero/curtain right - front (2).svg" alt="Right curtain front layer" 
         class="absolute max-w-none w-[180%] sm:w-[45%] md:w-[42%] top-0 
                -right-120 sm:right-0 md:-right-5 z-50" />

    <img bind:this={topCurtain} src="/svg/home/hero/curtain top.svg" alt="Top curtain" 
        class="absolute left-1/2 -translate-x-1/2 z-[60]
                -top-64 sm:-top-24 md:-top-140 
                max-w-none w-[120%] sm:w-[55%] md:w-1/2" />
    
    <img bind:this={topBanner} src="/svg/home/hero/banner red.svg" alt="Red banner" 
         class="absolute left-1/2 -translate-x-1/2 z-[70]
                -top-1 sm:-top-3 md:-top-5 
                max-w-none w-[30%] sm:w-[9%] md:w-[8%]" />
  </div>
</section>