<script lang="ts">
  import UKMBook from '$lib/components/home/UKMBook.svelte';

  let bookInstance: UKMBook;
  let currentPage = 0;

  const navItems = [
    { label: 'Fotografi', page: 2 },
    { label: 'Musik', page: 4 },
    { label: 'Kontak', page: 6 },
    { label: 'Cover', page: 8 },
    { label: 'Fotografi', page: 10 },
    { label: 'Musik', page: 12 },
    { label: 'Kontak', page: 14 },
    { label: 'Musik', page: 16 },
    { label: 'Kontak', page: 18 },
    { label: 'Kontak', page: 20 }
  ];

  function handlePageChange(event: CustomEvent) {
    currentPage = event.detail.currentPage;
  }

  function goToPage(pageNumber: number) {
    bookInstance.turnToPage(pageNumber);
  }
</script>

<section
  class="bg-table relative bg-cover bg-center flex text-center overflow-hidden
         h-screen
         justify-start md:justify-center 
         px-0 sm:px-4"
>
  <img src="/svg/home/ribbons.svg" alt="Ribbons" class="absolute -top-[5%] -left-[60%] md:-left-[15%] xl:-left-[5%] max-w-none w-[120%]  md:w-[70%] lg:w-[40%] xl:w-[35%] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"/>
  <img src="/svg/home/pennants.svg" alt="Pennants" class="absolute bottom-[15%] md:-bottom-[15%] xl:-bottom-[30%] -left-[10%] md:-left-[50%] xl:-left-[10%] max-w-none w-[100%] md:w-[140%] lg:w-[80%] xl:w-[75%] [transform:rotate(-5deg)] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"/>
  <img src="/svg/home/mask green.svg" alt="Green mask" class="absolute -top-[10%] md:-top-[15%] xl:-top-[35%] -right-[10%] md:right-[-10%] xl:right-[5%] w-[90%] md:w-[75%] lg:w-[50%] xl:w-[45%] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"/>
  <img src="/svg/home/mask purple.svg" alt="Purple mask" class="absolute -bottom-25 md:-bottom-[10%] xl:-bottom-[15%] -right-[80%] md:-right-[60%] xl:-right-[30%] max-w-none w-[160%] md:w-[120%] lg:w-[65%] xl:w-[60%] [filter:drop-shadow(0px_8px_8px_rgba(97,0,0,1))]"/>

  <div class="absolute top-1/4 md:top-[10%] flex items-center">
    
    <div class="w-[350px] h-[467px] sm:w-[400px] sm:h-[533px] md:w-[450px] md:h-[600px] 
                lg:w-[600px] lg:h-[800px] xl:w-[750px] xl:h-[1000px] 2xl:w-[900px] 2xl:h-[1200px] z-[5]">
      <UKMBook 
        bind:this={bookInstance} 
        on:pagechange={handlePageChange}
      />
    </div>

    <nav class="absolute top-0 left-full z-0 flex flex-col gap-3">
      {#each navItems as item}
        <button 
          on:click={() => goToPage(item.page)}
          class="bookmark-item"
          class:active={
            (item.page === 0 && currentPage === 0) || 
            (item.page > 0 && (currentPage === item.page || currentPage === item.page + 1))
          }
        >
          {item.label}
        </button>
      {/each}
    </nav>
  </div>

    <!-- <div class="absolute inset-0">
    <div class="absolute top-1/2 md:top-1/2  left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-[5] flex justify-center">
      <div class="w-[350px] h-[467px] sm:w-[400px] sm:h-[533px] md:w-[450px] md:h-[600px] 
                  lg:w-[600px] lg:h-[800px] xl:w-[750px] xl:h-[1000px] 2xl:w-[900px] 2xl:h-[1200px]">
        <UKMBook />
      </div>
    </div>
  </div> -->
</section>

<style>
  .bg-table {
    background-image: url('/background/table a.png');
  }
  @media (min-width: 1279px) {
    .bg-table {
      background-image: url('/background/table b.png');
    }
  }
  .bookmark-item {
    padding: 10px 16px 10px 24px;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    color: #f7f0e3;
    background-color: #5a3e36;
    border: none;
    border-radius: 0 8px 8px 0;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: -2px 2px 8px rgba(0,0,0,0.3);
    text-align: left;
    white-space: nowrap;
  }

  .bookmark-item:hover {
    background-color: #7d5a4d;
    transform: translateX(5px);
  }

  .bookmark-item.active {
    background-color: #c9a77d;
    color: #4a3e36;
    font-weight: bold;
    transform: translateX(10px);
    box-shadow: -2px 4px 12px rgba(0,0,0,0.4);
  }
</style>