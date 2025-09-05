<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import { transitionUrl } from '$lib/stores/transitionStore.js';

  let scrollContainer;
  let balloonAssembly;
  let rope;
  let screenWidth = 1920;
  let backgroundSky;

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

    const initTimer = setTimeout(() => {
      const ropeHeight = screenWidth < 640 ? '80vh' : screenWidth < 1024 ? '130vh' : '150vh';
      gsap.set(rope, { height: ropeHeight });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainer,
          start: 'top top',
          end: '+=3000',
          scrub: 1.5,
          pin: true,
          anticipatePin: 1
        }
      });

      const animationDistance = screenWidth < 640 ? '-60vh' : screenWidth < 1024 ? '-160vh' : '-180vh';
      tl.to(balloonAssembly, { y: animationDistance }, 0);
      tl.to(backgroundSky, { yPercent: -30 }, 0);

      const iconContainers = gsap.utils.toArray('.icon-container');
      
      iconContainers.forEach((container) => {
        const wrapper = container.querySelector('.icon-wrapper');
        const name = container.querySelector('.org-name');
        
        gsap.set(name, { x: -30 });

        ScrollTrigger.create({
          trigger: container,
          start: 'top 60%',
          end: 'top -10%',
          markers: true,
          onEnter: () => {
            gsap.to(name, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
          },
          onLeave: () => {
            gsap.to(name, { opacity: 0, x: -20, duration: 0.4, ease: 'power3.in' });
          },
          onEnterBack: () => {
            gsap.to(name, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
          },
          onLeaveBack: () => {
            gsap.to(name, { opacity: 0, x: -20, duration: 0.4, ease: 'power3.in' });
          }
        });
      });

    }, 100);


    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', updateScreenWidth);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  });
</script>

<div bind:this={scrollContainer} class="relative">
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
    <img bind:this={backgroundSky} 
         src="/background/pink sky.jpg" 
         alt="Purple sky background"
         class="absolute inset-0 w-full h-[150%] object-cover z-[-1]" />

    <div bind:this={balloonAssembly}
         class="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center z-[1]">
      <img
        class="w-[160px] sm:w-[150px] md:w-[180px] lg:w-[200px] xl:w-[220px]"
        src="/svg/home/balloon.svg"
        alt="Hot air balloon"
      />
      <div class="relative w-full">
        <div bind:this={rope}
             class="w-[3px] sm:w-[4px] bg-gradient-to-b from-[#260E16] via-[#c48462] to-[#ffe8aa] mx-auto">
        </div>
        <div class="absolute top-0 w-full h-full">
        {#each iconData as icon, i}
          <div 
            class="icon-container absolute left-1/2 -translate-x-1/2" 
            style="top: {15 + i * 20}%;"
          >
            <div class="relative flex justify-center items-center">
              <a 
                href={icon.path} 
                on:click|preventDefault={() => transitionUrl.set(icon.path)}
                class="icon-wrapper flex items-center justify-center 
                       bg-white/40 backdrop-blur-sm rounded-full shadow-lg 
                       transition-transform hover:scale-110 cursor-pointer
                       w-20 sm:w-24 md:w-28 lg:w-32
                       aspect-square"
              >
                <img
                  src={icon.src}
                  alt="{icon.name} Logo"
                  class="object-contain w-12 sm:w-14 md:w-16 lg:w-18"
                />
              </a>
              <span class="font-moomello tracking-tight bg-gradient-to-tr from-[var(--text-secondary)] via-[var(--text-primary)] to-[var(--color-white)] bg-clip-text text-transparent org-name absolute left-full ml-4 md:ml-6 text-2xl md:text-3xl lg:text-4xl whitespace-nowrap opacity-0 pointer-events-none drop-shadow-md">
                {icon.name}
              </span>
            </div>
          </div>
        {/each}
        </div>
      </div>
    </div>
    
    <img class="absolute -bottom-3 md:-bottom-[5%] w-full z-[0] 
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