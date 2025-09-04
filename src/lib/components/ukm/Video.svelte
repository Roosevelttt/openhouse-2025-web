<script>
  export let src = "";
  export let className = "";
  export let controls = true;
</script>

<video src={src} class={`${className} w-1/2`} {controls}>
  Your browser does not support the video tag.
</video>