<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import { transitionUrl } from '$lib/stores/transitionStore.js';

  let scrollContainer;
  let balloonAssembly;
  let backgroundSky;
  let screenWidth = 1920;

  const iconData = [
    { src: '/svg/logo/bem.svg', path: '/lk/bem', name: 'BEM' },
    { src: '/svg/logo/bpmf.svg', path: '/lk/bpmf', name: 'BPMF' },
    { src: '/svg/logo/mpm.svg', path: '/lk/mpm', name: 'MPM' },
    { src: '/svg/logo/pelma.svg', path: '/lk/pelma', name: 'PELMA' },
    { src: '/svg/logo/persma.svg', path: '/lk/persma', name: 'PERSMA' },
    { src: '/svg/logo/tps.svg', path: '/lk/tps', name: 'TPS' }
  ];

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    function updateScreenWidth() {
      if (typeof window !== 'undefined') {
        screenWidth = window.innerWidth;
      }
    }
    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);

    const random = (min, max) => Math.random() * (max - min) + min;
    const initTimer = setTimeout(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainer,
          start: 'top top',
          end: '+=3500',
          scrub: 1.5,
          pin: true,
          anticipatePin: 1
        }
      });

      const animationDistance = screenWidth < 768 ? '-150vh' : '-180vh';
      tl.to(balloonAssembly, { y: animationDistance }, 0);
      tl.to(backgroundSky, { yPercent: -30 }, 0);

      const orgBalloons = gsap.utils.toArray('.org-balloon');
      const numBalloons = orgBalloons.length > 1 ? orgBalloons.length : 2;
      
      const maxStartTime = 0.5;

      orgBalloons.forEach((balloon, i) => {
        const flightDurationOnTimeline = random(0.4, 0.6);
        const startTime = (i / (numBalloons - 1)) * maxStartTime;
        const horizontalDrift = random(-10, 10);

        tl.fromTo(
          balloon,
          { 
            y: '100vh',
            visibility: 'hidden' 
          },
          {
            y: '-100vh',
            x: `${horizontalDrift}vw`,
            visibility: 'visible',
            ease: 'none',
            duration: flightDurationOnTimeline
          },
          startTime
        );
      });
    }, 100);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', updateScreenWidth);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  });
</script>

<div bind:this={scrollContainer} class="relative">
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <img
      bind:this={backgroundSky}
      src="/background/pink sky v3.webp"
      alt="Purple sky background"
      class="absolute inset-0 max-w-none w-[102%] h-[150%] object-cover z-[-1]"
    />

    <div
      bind:this={balloonAssembly}
      class="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center z-[1]"
    >
      <h2 class="absolute -top-5 left-1/2 -translate-x-1/2 mb-4 md:mb-1 w-[100%] pointer-events-none
                 font-moomello text-[10rem] sm:text-[8rem] md:text-[6rem] lg:text-8xl tracking-tight">
        <svg viewBox="0 0 500 100" class="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="text-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:var(--text-secondary)" />
              <stop offset="50%" style="stop-color:var(--text-primary)" />
              <stop offset="100%" style="stop-color:var(--color-white)" />
            </linearGradient>
            <path id="curve" d="M 50 100 A 200 100 0 0 1 450 100" fill="transparent" />
          </defs>
          <text width="500" style="fill: url(#text-gradient);">
            <textPath xlink:href="#curve" startOffset="50%" text-anchor="middle">
              LK - KBM
            </textPath>
          </text>
        </svg>
      </h2>

      <img
        class="max-w-none w-60 sm:w-90 md:w-80 lg:w-70 xl:w-80"
        src="/svg/home/balloon.svg"
        alt="Hot air balloon"
      />
    </div>

    <div class="absolute inset-0 w-full h-full z-[2] overflow-hidden">
      {#each iconData as icon, i}
        <div
          class="org-balloon absolute w-60 sm:w-90 md:w-80 lg:w-70 xl:w-80"
          class:left-balloon={i % 3 === 0}
          class:right-balloon={i % 3 === 1}
          class:center-balloon={i % 3 === 2}
        >
          <a
            href={icon.path}
            on:click|preventDefault={() => transitionUrl.set(icon.path)}
            class="relative block transition-transform hover:scale-110 cursor-pointer group"
          >
            <img 
              src={`/svg/home/balloon ${icon.name.toLowerCase()}.svg`} 
              alt={`${icon.name} Balloon`} 
              class="w-full h-auto"
            />
            
            <span
              class="font-spicyrice tracking-tight bg-gradient-to-tr from-[var(--text-secondary)] via-[var(--text-primary)] to-[var(--color-white)] bg-clip-text text-transparent
                     absolute -bottom-12 md:-bottom-15 left-1/2 -translate-x-1/2 text-3xl md:text-5xl whitespace-nowrap drop-shadow-md"
            >
              {icon.name}
            </span>
          </a>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .org-balloon {
    position: absolute;
    top: 0;
    visibility: hidden;
  }

  .left-balloon {
    left: 15vw;
  }

  .right-balloon {
    right: 15vw;
  }

  .center-balloon {
    left: 50%;
    transform: translateX(-50%);
  }

  @media (max-width: 1024px) {
    .left-balloon {
      left: 8vw;
    }
    .right-balloon {
      right: 8vw;
    }
  }

  @media (max-width: 640px) {
    .left-balloon {
      left: 0;
      transform: translateX(-25%);
    }
    .right-balloon {
      right: 0;
      transform: translateX(25%);
    }
    .center-balloon {
      left: 50%;
      transform: translateX(-50%);
    }
  }
</style>