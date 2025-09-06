<script>
  export let text = "";
  export let ref = null;
  export let className = "";
  let title;
  $: ref && ref(title);
  
</script>
<h1 bind:this={title} class="uppercase text-7xl font-bold tracking-wider font-moomello text-center text-[var(--color-light-gold)] [text-shadow:0_4px_4px_rgba(0,0,0,0.25)] 
   {className}">
  {@html text}
</h1>