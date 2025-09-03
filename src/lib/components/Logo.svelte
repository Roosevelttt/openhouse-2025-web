<script>
  export let src = "";
  export let alt = "";
  export let ref = null;
  export let className = "";
  let logo;
  $: ref && ref(logo);
</script>

<img src={src} alt={alt} bind:this={logo} class={`logo w-full sm:md:w-3/4 lg:w-[40%] mx-auto ${className}`} />