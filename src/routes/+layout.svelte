<script>
  import "../app.css"; 
  
  import { afterNavigate, goto } from '$app/navigation';
  import { transitionUrl } from '$lib/stores/transitionStore.js';
  import { gsap } from 'gsap';
  import { onMount } from 'svelte';

  let cloudLeft, cloudRight, cloudSilhouetteLeft, cloudSilhouetteRight;
  let isAnimating = false;

  onMount(() => {
    gsap.set([cloudLeft, cloudSilhouetteLeft], { xPercent: -100 });
    gsap.set([cloudRight, cloudSilhouetteRight], { xPercent: 100 });
  });

  // store changes watcher
  $: if ($transitionUrl && !isAnimating) {
    isAnimating = true;
    const targetUrl = $transitionUrl;

    const tl = gsap.timeline({
      onComplete: () => {
        goto(targetUrl);
      }
    });

    tl.to([cloudLeft, cloudRight], { xPercent: 0, duration: 0.8, ease: 'power2.inOut' }, 0);
    tl.to([cloudSilhouetteLeft, cloudSilhouetteRight], { xPercent: 0, duration: 0.8, ease: 'power2.inOut' }, 0);
  }

  afterNavigate(() => {
    if (isAnimating) {
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          transitionUrl.set(null);
        }
      });

      tl.to(cloudLeft, { xPercent: -100, duration: 0.8, ease: 'power2.inOut' }, 0);
      tl.to(cloudRight, { xPercent: 100, duration: 0.8, ease: 'power2.inOut' }, 0);
      tl.to(cloudSilhouetteLeft, { xPercent: -100, duration: 0.8, ease: 'power2.inOut' }, 0);
      tl.to(cloudSilhouetteRight, { xPercent: 100, duration: 0.8, ease: 'power2.inOut' }, 0);
    }
  });
</script>

<main>
  <slot />
</main>

<div class="fixed inset-0 overflow-hidden pointer-events-none z-[9999]">
  <img
    bind:this={cloudSilhouetteLeft}
    src="/svg/home/lk/cloud/cloud silhouette left.svg"
    alt="Cloud Silhouette"
    class="absolute top-[5%] left-0 w-[100%] h-auto z-0"
  />
  <img
    bind:this={cloudSilhouetteRight}
    src="/svg/home/lk/cloud/cloud silhouette right.svg"
    alt="Cloud Silhouette"
    class="absolute top-[5%] right-0 w-[100%] h-auto z-0"
  />

  <img
    bind:this={cloudLeft}
    src="/svg/home/lk/cloud/cloud left.svg"
    alt="Cloud"
    class="absolute top-[10%] left-0 w-[100%] h-auto z-10"
  />
  <img
    bind:this={cloudRight}
    src="/svg/home/lk/cloud/cloud right.svg"
    alt="Cloud"
    class="absolute top-[10%] right-0 w-[100%] h-auto z-10"
  />
</div>