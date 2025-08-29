<script lang="ts">
  import { get } from '$lib/api';
  import { onMount } from 'svelte';
  let ukms: Array<{ id: string; name: string; slug: string; current_slot: number; max_slot: number; regist_fee: number }>=[];
  let error: string | null = null;
  onMount(async () => {
    try { ukms = await get('/api/user/ukms'); } catch (e: any) { error = e.message; }
  });
</script>

<h1>UKM</h1>
{#if error}
  <p>{error}</p>
{:else}
  <ul>
    {#each ukms as u}
      <li>{u.name} ({u.current_slot}/{u.max_slot})</li>
    {/each}
  </ul>
{/if}

