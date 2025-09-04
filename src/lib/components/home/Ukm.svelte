<script lang="ts">
  import UKMBook from '$lib/components/home/UKMBook.svelte';
  import JournalBook from '$lib/components/home/JournalBook.svelte';
</script>

<section
  class="relative min-h-screen bg-cover bg-center flex justify-center items-center text-center overflow-hidden px-4"
  style="background-image: url('/background/table b.png');"
>
  <img
    src="/svg/home/ribbons.svg"
    alt="Ribbons"
    class="absolute -top-[5%] -left-[5%] 
           w-[60%] sm:w-[50%] md:w-[45%] lg:w-[40%] xl:w-[35%]
           [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
  />
  <img
    src="/svg/home/pennants.svg"
    alt="Pennants"
    class="absolute z-4 -bottom-[30%] -left-[10%] 
           w-[100%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]
           [transform:rotate(-5deg)] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
  />
  <img
    src="/svg/home/mask green.svg"
    alt="Green mask"
    class="absolute -top-[35%] right-[5%] 
           w-[70%] sm:w-[60%] md:w-[55%] lg:w-[50%] xl:w-[45%]
           [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
  />
  <img
    src="/svg/home/mask purple.svg"
    alt="Purple mask"
    class="absolute -bottom-[15%] -right-[30%] 
           w-[85%] sm:w-[75%] md:w-[70%] lg:w-[65%] xl:w-[60%]
           [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"
  />

  <div class="absolute inset-0">
    <div class="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-[5] flex justify-center">
      <div class="w-[350px] h-[467px] sm:w-[400px] sm:h-[533px] md:w-[450px] md:h-[600px] 
                  lg:w-[600px] lg:h-[800px] xl:w-[750px] xl:h-[1000px] 2xl:w-[900px] 2xl:h-[1200px]">
        <UKMBook />
      </div>
    </div>
  </div>
</section>

<style>
</style>