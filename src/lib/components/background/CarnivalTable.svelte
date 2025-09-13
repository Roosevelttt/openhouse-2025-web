<script lang="ts">
  import { onMount } from 'svelte';
  import { assetLoadingPromises } from '$lib/asset-loader';

  let imageElements: HTMLImageElement[] = [];

  onMount(() => {
    const newPromises: Promise<void>[] = [];

    imageElements.forEach((imgElement) => {
      if (!imgElement) return; 

      const promise = new Promise<void>((resolve) => {
        if (imgElement.complete) {
          resolve();
        } else {
          imgElement.addEventListener('load', () => resolve(), { once: true });
          imgElement.addEventListener('error', () => resolve(), { once: true });
        }
      });
      newPromises.push(promise);
    });

    const backgroundImageURL = '/background/table-bg.webp';
    const bgImagePromise = new Promise<void>((resolve) => {
      const img = new Image();
      img.src = backgroundImageURL;
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
    newPromises.push(bgImagePromise);

    if (newPromises.length > 0) {
      assetLoadingPromises.update((existing) => [...existing, ...newPromises]);
    }
  });
</script>

<div class="fixed inset-0 z-[-1] bg-table bg-cover bg-center">
  <img 
    src="/svg/home/ribbons.svg" 
    alt="Ribbons" 
    class="absolute -top-[5%] -left-[60%] md:-left-[15%] xl:-left-[5%] max-w-none w-[120%] md:w-[70%] lg:w-[40%] xl:w-[35%] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
    bind:this={imageElements[0]} />
  <img 
    src="/svg/home/pennants.svg" 
    alt="Pennants" 
    class="absolute bottom-[15%] md:-bottom-[15%] xl:-bottom-[30%] -left-[10%] md:-left-[50%] xl:-left-[10%] max-w-none w-[100%] md:w-[140%] lg:w-[80%] xl:w-[75%] [transform:rotate(-5deg)] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
    bind:this={imageElements[1]} />
  <img 
    src="/svg/home/mask green.svg" 
    alt="Green mask" 
    class="absolute -top-[10%] md:-top-[15%] xl:-top-[15%] -right-[10%] md:right-[-10%] xl:right-[5%] w-[90%] md:w-[75%] lg:w-[50%] xl:w-[45%] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
    bind:this={imageElements[2]} />
  <img 
    src="/svg/home/mask purple.svg" 
    alt="Purple mask" 
    class="absolute -bottom-25 md:-bottom-[10%] xl:-bottom-[15%] -right-[80%] md:-right-[60%] xl:-right-[30%] max-w-none w-[160%] md:w-[120%] lg:w-[65%] xl:w-[60%] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
    bind:this={imageElements[3]} />
</div>

<style>
  .bg-table {
    background-image: url('/background/table-bg.webp');
  }
</style>