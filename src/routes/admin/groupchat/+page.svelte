<script lang="ts">
  import { onMount } from "svelte";
  import { get, put } from "$lib/api";
  import Swal from "sweetalert2";

  let isEditing = $state(false);
  let groupchatLink = $state("");
  let isLoading = $state(true);

  // Fetch the initial link when the component loads
  onMount(async () => {
    try {
      const data = await get<{ groupchat_link: string }>(
        "/api/admin/ukm/groupchat",
      );
      groupchatLink = data.groupchat_link;
    } catch (e: any) {
      Swal.fire({
        title: "Error!",
        text: "Failed to load group chat link.",
        icon: "error",
      });
    } finally {
      isLoading = false;
    }
  });

  function toggleEdit() {
    isEditing = !isEditing;
  }

  async function saveLink() {
    isLoading = true;
    try {
      await put("/api/admin/ukm/groupchat", { link: groupchatLink });

      Swal.fire({
        title: "Success!",
        text: "Group chat link has been updated.",
        icon: "success",
      });
      isEditing = false; // Disable editing after successful save
    } catch (e: any) {
      Swal.fire({
        title: "Error!",
        text: `Failed to save link: ${JSON.parse(e.message).message}`,
        icon: "error",
      });
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>OH Admin | Groupchat</title>
</svelte:head>

<h1 class="text-2xl font-bold tracking-wide text-gray-800">Link Group Chat</h1>

<div class="flex flex-col gap-2 rounded-2xl p-6 text-sm shadow-md">
  <div
    class={[
      "flex h-10 max-w-lg items-center rounded border  font-semibold",
      isEditing
        ? "border-indigo-700 text-gray-600"
        : "border-gray-300 text-gray-400",
    ]}
  >
    <input
      bind:value={groupchatLink}
      class="flex-grow p-2"
      type="text"
      placeholder="Belum ada link group chat (Pastikan bentuk link URL)"
      disabled={!isEditing || isLoading}
    />
    <div
      class="flex h-full w-12 items-center justify-center bg-indigo-700 text-white"
    >
      <button
        onclick={toggleEdit}
        class="flex h-full w-12 cursor-pointer items-center justify-center bg-indigo-700 text-white transition-colors hover:bg-indigo-600"
        title="Edit Link"
      >
        {#if isEditing}
          <!-- Cancel Icon (X) -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        {:else}
          <!-- Edit Icon (Pencil) -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        {/if}
      </button>
    </div>
  </div>
  {#if isEditing}
    <button
      onclick={saveLink}
      disabled={isLoading}
      type="submit"
      class="h-10 w-fit rounded border-gray-300 bg-indigo-700 px-16 text-white transition-colors hover:bg-indigo-600 active:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-indigo-400"
    >
      {isLoading ? "Menyimpan..." : "Simpan"}
    </button>
  {/if}
</div>
