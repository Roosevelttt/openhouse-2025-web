<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { createEventDispatcher } from 'svelte';
  import { ukmData } from '$lib/data/ukmData';

  const dispatch = createEventDispatcher();
  let bookContainer!: HTMLElement;
  let isClosed = true;
  let pageFlip: any = null;

  onMount(async () => {
    if (browser) {
      try {
        const pageFlipModule = await import('page-flip');
        const PageFlip = pageFlipModule.PageFlip;

        pageFlip = new PageFlip(bookContainer, {
          width: 450,
          height: 600,
          showCover: true,
          size: 'stretch',
          minWidth: 315,
          maxWidth: 1000,
          minHeight: 420,
          maxHeight: 1350
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.book-page'));
        dispatch('init');
        pageFlip.on('flip', (e: { data: number }) => {
          isClosed = e.data === 0;
          dispatch('pagechange', { currentPage: e.data });
        });
      } catch (error) {
        console.error('Failed to load or initialize PageFlip:', error);
      }
    }
  });

  export function turnToPage(page: number) {
    if (pageFlip && pageFlip.getCurrentPageIndex() !== page) {
      pageFlip.turnToPage(page);
      dispatch('pagechange', { currentPage: page });
    }
  }
</script>

<div class="book-wrapper" class:is-closed={isClosed}>
  <div bind:this={bookContainer}>
    <div class="book-page front-cover" />

    {#each ukmData as ukm (ukm.slug)}
      <div class="book-page">
        <div class="page-content">
          <h2>{ukm.name}</h2>
          <div class="ukm-logo-container">
            <img src={ukm.logoSrc} alt="{ukm.name} Logo" class="ukm-logo" />
          </div>
          <p class="ukm-overview">{ukm.overview}</p>
          
          <a
            href="/ukm/{ukm.slug}"
            class="mt-auto block text-center font-bold no-underline transition-opacity hover:opacity-80
                   bg-gradient-to-r from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)] 
                   bg-clip-text text-transparent"
          >
            Learn More &rarr;
          </a>
          </div>
      </div>
    {/each}

    <div class="book-page back-cover" />
  </div>
</div>

<style>
  .book-page {
    background-image: url('/background/paper texture.jpg');
    background-size: cover;
    background-position: center center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .front-cover {
    background-image: url('/png/ukm cover.png');
    background-size: cover;
    background-position: center;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .back-cover-front {
    background-color: #f7f0e3;
    background-image: url('/background/paper texture.jpg');
    background-size: cover;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .back-cover {
    background: linear-gradient(135deg, #5a3e36 0%, #3d2b24 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  .back-cover-content {
    padding: 2rem;
    text-align: center;
    color: #f7f0e3;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .back-cover-content h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #f7f0e3;
  }

  .back-cover-footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(247, 240, 227, 0.3);
  }

  .back-cover-footer p {
    margin: 0.25rem 0;
    font-size: 0.8rem;
    opacity: 0.8;
  }
  
 .page-content {
    padding: 2rem;
    font-family: 'Georgia', serif;
    color: #4a3e36;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  .page-content h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #5a3e36;
    border-bottom: 2px solid #c2b5a3;
    padding-bottom: 0.5rem;
    text-align: center;
  }
  
  .page-content p {
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
   .ukm-logo-container {
    width: 100%;
    max-height: 200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: start;
    border-radius: 100%;
  }
  .ukm-logo {
    max-width: 100%;
    max-height: 80%;
    object-fit: contain;
    border-radius: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    padding: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .ukm-overview {
    flex-grow: 1;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  :global(.stf__hardShadow), :global(.stf__hardInnerShadow) {
    display: none !important;
  }

  :global(.stf__outerShadow),
  :global(.stf__innerShadow),
  :global(.stf__hardShadow),
  :global(.stf__hardInnerShadow) {
    display: none !important;
  }
</style>