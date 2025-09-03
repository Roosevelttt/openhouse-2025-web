<script>
  export let src;
  export let className = "";
  export let ref = null;
  let frame;
  $: ref && ref(frame);
</script>

<!-- svelte-ignore a11y_img_redundant_alt -->
<div data-aos="fade-up" data-aos-offset=500 class={`${className}`} bind:this={frame}>
  <div class="relative">
    <img src="/images/ukm/photo-frame.webp" alt=""
      class="absolute top-0 left-0 z-10">
    <img src="{src}" alt=""
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[90%]">
  </div>
</div>
