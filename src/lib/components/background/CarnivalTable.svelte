<script lang="ts">
  let className = '';
  export { className as class };
</script>

  <!-- <CarnivalTable class="min-h-screen flex items-center justify-center">
    <Component />
  </CarnivalTable> -->
  
<div class="bg-container relative overflow-hidden {className}">
  <img 
    src="/svg/home/ribbons.svg" 
    alt="Ribbons" 
    class="absolute -top-[5%] -left-[60%] md:-left-[15%] xl:-left-[5%] max-w-none w-[120%] md:w-[70%] lg:w-[40%] xl:w-[35%] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
  />
  <img 
    src="/svg/home/pennants.svg" 
    alt="Pennants" 
    class="absolute bottom-[15%] md:-bottom-[15%] xl:-bottom-[30%] -left-[10%] md:-left-[50%] xl:-left-[10%] max-w-none w-[100%] md:w-[140%] lg:w-[80%] xl:w-[75%] [transform:rotate(-5deg)] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
  />
  <img 
    src="/svg/home/mask green.svg" 
    alt="Green mask" 
    class="absolute -top-[10%] md:-top-[15%] xl:-top-[35%] -right-[10%] md:right-[-10%] xl:right-[5%] w-[90%] md:w-[75%] lg:w-[50%] xl:w-[45%] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
  />
  <img 
    src="/svg/home/mask purple.svg" 
    alt="Purple mask" 
    class="absolute -bottom-25 md:-bottom-[10%] xl:-bottom-[15%] -right-[80%] md:-right-[60%] xl:-right-[30%] max-w-none w-[160%] md:w-[120%] lg:w-[65%] xl:w-[60%] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))] z-10"
  />

  <slot />
</div>

<style>
  .bg-container {
    position: relative;
    isolation: isolate;
  }

  .bg-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    background-image: url('/background/table b.png');
    background-size: cover;
    background-position: center;
    transition: transform 0.3s ease;
  }

  @media (max-width: 1279px) {
    .bg-container::before {
      transform: rotate(-90deg) scaleX(-1);
      scale: 1.7;
    }
  }
</style>