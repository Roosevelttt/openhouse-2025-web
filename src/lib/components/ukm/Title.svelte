<script>
  export let text = "";
  export let ref = null;
  export let className = "";
  let title;
  $: ref && ref(title);
</script>
<h1 bind:this={title} class="uppercase text-6xl font-bold tracking-wider font-moomello text-center text-[#FFF4E9] [text-shadow:0_4px_4px_rgba(0,0,0,0.25)] 
   {className}">
  {text}
</h1>