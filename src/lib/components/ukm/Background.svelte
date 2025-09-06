<script>
  // export let image = ""; 
  export let className = "";
  export let ref = null;
  let background;
  $: ref && ref(background);
</script>

<section class="relative min-h-screen w-screen {className} overflow-hidden" bind:this={background}>
    <!-- insert other components here -->
    <slot />
</section>
