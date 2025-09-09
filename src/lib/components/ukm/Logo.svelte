<script>
  export let src = "";
  export let alt = "";
  export let ref = null;
  export let className = "";
  let logo;
  $: ref && ref(logo);
</script>

<div bind:this={logo} class="bg-white flex items-center justify-center p-2 rounded-full shadow-lg w-3/4 lg:w-1/2 mx-auto aspect-square">
  <img src={src} alt={alt}  class={`w-full logo ${className}`} />
</div>