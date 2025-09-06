<script>
  export let src = "";
  export let className = "";
</script>

<div class={`aspect-[9/16] w-full flex items-center justify-center ${className}`}>
  {#if src.includes("drive.google.com")}
    <iframe
      src={src.replace("/view", "/preview")}
      class="w-full h-full"
      allow="autoplay; encrypted-media"
      allowfullscreen
      frameborder="0"
      title="Google Drive Video"
    ></iframe>
  {/if}
</div>