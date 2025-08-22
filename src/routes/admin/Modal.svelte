<!-- GAK KEPAKE -->

<script>
  let { showModal = $bindable(), header, body, footer } = $props();

  let dialog = $state(); // HTMLDialogElement

  $effect(() => {
    if (showModal) dialog.showModal();
  });
</script>

<dialog
  class="m-auto h-full w-full rounded-sm bg-transparent backdrop:bg-black/30 open:flex open:items-center open:justify-center"
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
>
  <div class="flex flex-col items-center rounded-sm bg-white p-4">
    {#if header}
      <h2 class="text-lg font-semibold">{header}</h2>
    {/if}
    <div>
      {@render body?.()}
    </div>
    <div>
      {#if footer}
        {@render footer?.()}
      {:else}
        <button autofocus onclick={() => dialog.close()}>close modal</button>
      {/if}
    </div>
  </div>
</dialog>

<style>
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  button {
    display: block;
  }
</style>
