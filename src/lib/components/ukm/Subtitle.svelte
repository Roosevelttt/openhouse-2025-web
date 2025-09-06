<script>
  export let text = "";
  export let className = "";
  export let ref = null;
  let sub;
  $: ref && ref(sub);
</script>

<p bind:this={sub} class={`transition-all ${className} font-lexend text-[#FFF4E9] `}>{@html text}</p>