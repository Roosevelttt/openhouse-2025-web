<script>
  export let src = "";
  export let className = "";
  export let controls = true; // not used for iframe
</script>

<div class={`aspect-[9/16] w-full flex items-center justify-center ${className}`}>
  {#if src.includes("drive.google.com")}
    <iframe
      src={src.replace("/view", "/preview")}
      class="w-full h-full"
      allow="autoplay; encrypted-media"
      allowfullscreen
      frameborder="0"
    ></iframe>
  {:else}
    <video src={src} class="w-full h-full" {controls}>
      Your browser does not support the video tag.
    </video>
  {/if}
</div>