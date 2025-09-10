<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

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

  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  onMount(() => {
    let ScrollTrigger: any;
    
    const setupScrollTrigger = async () => {
      const { ScrollTrigger: ST } = await import('gsap/ScrollTrigger');
      ScrollTrigger = ST;
      gsap.registerPlugin(ScrollTrigger);
      
      setupScrollAnimations();
    };

    const setupScrollAnimations = () => {
      ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
      
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

      gsap.to([heroTitle, heroTitleMobile], {
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

    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        deviceType = 'mobile';
      } else if (width >= 768 && width <= 1024) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }
    };
    
    const createOpeningAnimation = () => {
      checkDeviceType();
      
      gsap.killTweensOf([
        rightCurtainFront, rightCurtainMiddle, leftCurtainFront, leftCurtainMiddle,
        topBanner, topCurtain, behindBanner, behindCurtains, heroTitle, heroTitleMobile
      ]);

      const openingTl = gsap.timeline({
        delay: 0.1,
      });

      let animationValues;
      
      switch(deviceType) {
        case 'mobile':
          animationValues = {
            rightFrontMove: 40,
            rightMiddleMove: 42,
            leftFrontMove: -40,
            leftMiddleMove: -42,
            topBannerMove: -42,
            topCurtainMove: -46,
            behindBannerMove: -160,
            behindCurtainsMove: -400
          };
          break;
          
        case 'tablet':
          animationValues = {
            rightFrontMove: 48,
            rightMiddleMove: 30,
            leftFrontMove: -48,
            leftMiddleMove: -30,
            topBannerMove: -45,
            topCurtainMove: -50,
            behindBannerMove: -115,
            behindCurtainsMove: -200
          };
          break;
          
        default:
          animationValues = {
            rightFrontMove: 55,
            rightMiddleMove: 55,
            leftFrontMove: -55,
            leftMiddleMove: -55,
            topBannerMove: -40,
            topCurtainMove: -30,
            behindBannerMove: -110,
            behindCurtainsMove: -120
          };
      }

      openingTl.to(rightCurtainFront, { 
        xPercent: animationValues.rightFrontMove, 
        duration: 2, 
        ease: 'power3.inOut' 
      }, 0);
      
      openingTl.to(rightCurtainMiddle, { 
        xPercent: animationValues.rightMiddleMove, 
        duration: 2.2, 
        ease: 'power3.inOut' 
      }, 0);
      
      openingTl.to(leftCurtainFront, { 
        xPercent: animationValues.leftFrontMove, 
        duration: 2, 
        ease: 'power3.inOut' 
      }, 0);
      
      openingTl.to(leftCurtainMiddle, { 
        xPercent: animationValues.leftMiddleMove, 
        duration: 2.2, 
        ease: 'power3.inOut' 
      }, 0);
      
      openingTl.to(topBanner, { 
        yPercent: animationValues.topBannerMove, 
        duration: 2.2, 
        ease: 'power3.inOut' 
      }, 0);
      
      openingTl.to(topCurtain, { 
        yPercent: animationValues.topCurtainMove, 
        duration: 2.4, 
        ease: 'power3.inOut' 
      }, 0);
      
      openingTl.to(behindBanner, { 
        yPercent: animationValues.behindBannerMove, 
        duration: 2.3, 
        ease: 'power3.inOut' 
      }, 0);
      
      openingTl.to(behindCurtains, { 
        yPercent: animationValues.behindCurtainsMove, 
        duration: 1.8, 
        ease: 'power3.inOut' 
      }, 0);
      
      openingTl.to([heroTitle, heroTitleMobile], { 
        opacity: 1, 
        duration: 1.5 
      }, 1);

      openingTl.call(() => {
        setupScrollTrigger();
      });
    };
    
    const handleResize = () => {
      const oldDeviceType = deviceType;
      checkDeviceType();
      
      if (oldDeviceType !== deviceType) {
        createOpeningAnimation();
      }
    };
    
    createOpeningAnimation();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
      }
      gsap.killTweensOf('*');
    };
  });
</script>

<section 
  bind:this={heroSection}
  class="relative flex justify-center items-center text-white text-center
         h-screen max-w-none md:max-h-none"
>
  <div class="absolute inset-0 w-full h-full">
    <video playsinline autoplay muted loop class="w-full h-full object-cover">
      <source src="/videos/teaser-landscape.mp4" type="video/webm" />
    </video>
  </div>

  <div
    bind:this={heroTitle}
    class="relative z-0 font-moomello opacity-0 drop-shadow-[0_10px_30px_rgba(96,0,0,0.25)]
          text-[4rem] sm:text-[6rem] md:text-[7rem] lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem]
          bg-gradient-to-tr from-[#F6BABC] via-[#FEF7EB] to-white bg-clip-text text-transparent
          px-4 hidden sm:block" >
    <h1>OPENHOUSE</h1>
  </div>

  <div
    bind:this={heroTitleMobile}
    class="relative z-0 font-moomello opacity-0 drop-shadow-[0_10px_30px_rgba(96,0,0,0.25)]
          bg-gradient-to-tr from-[#F6BABC] via-[#FEF7EB] to-white bg-clip-text text-transparent
          px-4 block sm:hidden text-[7rem]" >
    <h1>OPENHOUSE</h1>
  </div>

  <div class="absolute inset-0 w-full h-full">
    <img src="/svg/home/hero/stage bottom v2.svg" alt="Stage bottom" 
         class="absolute -bottom-30 sm:-bottom-20 md:-bottom-40 lg:-bottom-32 xl:-bottom-40 
                left-1/2 -translate-x-1/2 max-w-none 
                w-[300%] sm:w-[130%] md:w-[200%] lg:w-[150%] xl:w-[101%] z-[60]" />

    <img bind:this={behindCurtains} src="/svg/home/hero/curtains behind.svg" alt="Behind curtains" 
         class="absolute bottom-0 left-1/2 -translate-x-1/2 max-w-none 
                w-[180%] sm:w-[85%] md:w-[140%] lg:w-[140%] xl:w-[68%] z-10" />
    
    <img bind:this={behindBanner} src="/svg/home/hero/stage banner - behind.svg" alt="Stage banner background" 
         class="absolute top-70 sm:top-50 md:top-30 lg:top-40 xl:top-8 inset-x-0 mx-auto max-w-none 
                w-[45%] sm:w-[20%] md:w-[40%] lg:w-[36%] xl:w-[16%] z-20" />

    <img bind:this={leftCurtainMiddle} src="/svg/home/hero/curtain-left-middle.svg" alt="Left curtain middle layer" 
         class="absolute max-w-none -top-2 z-40
                w-[200%] sm:w-[100%] md:w-[140%] lg:w-[110%] xl:w-[44%]
                -left-120 sm:-left-60 md:-left-170 lg:-left-140 xl:left-22" />
    
    <img bind:this={leftCurtainFront} src="/svg/home/hero/curtain left - front (2).svg" alt="Left curtain front layer" 
         class="absolute max-w-none -top-1 z-50
                w-[180%] sm:w-[48%] md:w-[60%] lg:w-[43%] xl:w-[42%]
                -left-120 sm:-left-2 md:left-0 lg:-left-2 xl:-left-5" />

    <img bind:this={rightCurtainMiddle} src="/svg/home/hero/curtain-right-middle.svg" alt="Right curtain middle layer" 
         class="absolute max-w-none -top-2 z-40
                w-[200%] sm:w-[100%] md:w-[140%] lg:w-[110%] xl:w-[44%]
                -right-120 sm:-right-60 md:-right-170 lg:-right-140 xl:right-22" />
    
    <img bind:this={rightCurtainFront} src="/svg/home/hero/curtain right - front (2).svg" alt="Right curtain front layer" 
         class="absolute max-w-none -top-1 z-50
                w-[180%] sm:w-[48%] md:w-[60%] lg:w-[43%] xl:w-[42%]
                -right-120 sm:-right-2 md:right-0 lg:-right-2 xl:-right-5" />

    <img bind:this={topCurtain} src="/svg/home/hero/curtain top.svg" alt="Top curtain" 
        class="absolute left-1/2 -translate-x-1/2 z-[60] max-w-none
                -top-64 sm:-top-60 md:-top-92 lg:-top-106 xl:-top-140 
                w-[120%] sm:w-[50%] md:w-[95%] lg:w-[80%] xl:w-1/2" />
    
    <img bind:this={topBanner} src="/svg/home/hero/banner red.svg" alt="Red banner" 
         class="absolute left-1/2 -translate-x-1/2 z-[70] max-w-none
                -top-1 sm:-top-1 md:-top-4 lg:-top-4 xl:-top-5 
                w-[30%] sm:w-[15%] md:w-[20%] lg:w-[20%] xl:w-[8%]" />
  </div>
</section>