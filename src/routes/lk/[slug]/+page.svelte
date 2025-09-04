<script>
  import { page } from '$app/stores';
  import { transitionUrl } from '$lib/stores/transitionStore.js';

  // get slug name from url
  const orgName = $page.params.slug.toUpperCase();
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-[#382e5f] text-white text-center p-4">
  <h1 class="text-6xl font-moomello mb-4">
    {orgName}
  </h1>
  <p class="text-xl mb-8">
    placeholder {orgName}.
  </p>

  <a
    href="/"
    class="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-lg font-bold hover:bg-white/30 transition-colors"
    on:click|preventDefault={() => transitionUrl.set('/')}
  >
    return
  </a>
</div>