<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import { transitionUrl } from '$lib/stores/transitionStore.js';

  let scrollContainer;
  let balloonAssembly; 
  let rope;
  let icons = [];
  let screenWidth = 1920;
  let backgroundSky;

  const iconData = [
    { src: '/png/logo/bem.png', path: '/lk/bem' },
    { src: '/png/logo/bpmf.png', path: '/lk/bpmf' },
    { src: '/png/logo/mpm.png', path: '/lk/mpm' },
    { src: '/svg/logo/pelma.svg', path: '/lk/pelma' },
    { src: '/png/logo/persma.png', path: '/lk/persma' },
    { src: '/png/logo/tps.png', path: '/lk/tps' }
  ];

  function registerIcon(el, i) {
    if (el) icons[i] = el;
  }
  
  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    function updateScreenWidth() {
      if (typeof window !== 'undefined') {
        screenWidth = window.innerWidth;
      }
    }
    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);

    requestAnimationFrame(() => {
      const ropeHeight = screenWidth < 640 ? '120vh' : screenWidth < 1024 ? '140vh' : '160vh';
      gsap.set(rope, { height: ropeHeight });
      gsap.set(icons, { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainer,
          start: 'top top',
          end: '+=5000',
          scrub: 1.5,
          pin: true,
          anticipatePin: 1
        }
      });

      const animationDistance = screenWidth < 640 ? '-140vh' : screenWidth < 1024 ? '-160vh' : '-180vh';
      tl.to(balloonAssembly, { y: animationDistance }, 0);
      tl.to(backgroundSky, { yPercent: -30 }, 0);
    });

    return () => {
      window.removeEventListener('resize', updateScreenWidth);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  });
</script>

<div bind:this={scrollContainer} class="relative">
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
    <img bind:this={backgroundSky} 
         src="/background/purple sky.jpg" 
         alt="Purple sky background"
         class="absolute inset-0 w-full h-[150%] object-cover z-[-1]" />
    <h1 class="absolute font-moomello z-[0] drop-shadow-xl text-white/20
               text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[30rem]">
      LK
    </h1>

    <div bind:this={balloonAssembly}
         class="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center z-[1]">
      <img
        class="w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] xl:w-[220px]"
        src="/svg/home/balloon.svg"
        alt="Hot air balloon"
      />
      <div class="relative w-full">
        <div bind:this={rope}
             class="w-[3px] sm:w-[4px] bg-yellow-900/60 mx-auto">
        </div>
        <div class="absolute top-0 w-full h-full">
          {#each iconData as icon, i}
            <a 
              href={icon.path} 
              class="absolute left-1/2 -translate-x-1/2"
              style="top: {15 + i * 10}%;"
              on:click|preventDefault={() => transitionUrl.set(icon.path)}
            >
              <img
                use:registerIcon={{i}} src={icon.src}
                alt="Organization Logo"
                class="object-contain cursor-pointer transition-transform hover:scale-110
                       w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
                       p-1.5 sm:p-2 bg-white/70 backdrop-blur-sm rounded-full shadow-lg"
              />
            </a>
          {/each}
        </div>
      </div>
    </div>
    
    <img class="absolute -bottom-[5%] w-full z-[0] 
               min-w-[100vw] object-cover" 
         src="/svg/home/cloud.svg" 
         alt="Cloud" />
  </section>
</div>

<style>

  @media (max-width: 639px) {
    .relative {
      font-size: 0.8rem;
    }
  }

  @media (min-width: 640px) and (max-width: 767px) {
    .relative {
      font-size: 0.9rem;
    }
  }

  @media (min-width: 768px) {
    .relative {
      font-size: 1rem;
    }
  }
</style>