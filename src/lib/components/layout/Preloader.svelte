<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let isLoading = true;
  let loaderElement;
  let backgroundElement;
  
  onMount(() => {
    if (!browser) return;

    let hasLoaded = false;
    
    const handleLoad = () => {
      if (hasLoaded) return;
      hasLoaded = true;

      setTimeout(() => {
        finishLoading();
      }, 500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(failsafeTimer);
      };
    }
  });

  function finishLoading() {
    if (backgroundElement) {
      backgroundElement.style.opacity = '0';
    }
    
    if (loaderElement) {
      loaderElement.style.transform = 'translate(-50%, -50%) rotate(360deg) scale(0.5)';
      loaderElement.style.opacity = '0';
    }
    
    setTimeout(() => {
      isLoading = false;
    }, 600);  
  }
</script>


{#if isLoading}
  <div 
    bind:this={backgroundElement}
    class="preloader-background"
    style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: linear-gradient(0deg, #20002a, #373d7e, #20002a);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.6s ease-out;
    "
  >
    <div 
      bind:this={loaderElement}
      class="loader-container"
      style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        height: 400px;
        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        overflow: hidden;
      "
    >
      <div 
        style="
          position: absolute;
          top: 0;
          left: -29.5%;
          width: 175%;
          height: 100%;
          clip-path: inset(0 30% 0 25%);
        "
      >
        <object 
          data="/loader/mascot-loader.svg" 
          type="image/svg+xml"
          style="
            width: 100%;
            height: 100%;
            pointer-events: none;
          "
          aria-label="Loading animation"
        ></object>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.preloader-background) {
    will-change: opacity;
  }
  
  :global(.loader-container) {
    will-change: transform, opacity;
  }
</style>