<script lang="ts">
  import { onMount } from "svelte";
  import { get, put } from "$lib/api";
  import Swal from "sweetalert2";

  let isEditing = $state(false);
  let groupchatLink = $state("");
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);

  // Fetch the initial link when the component loads
  onMount(async () => {
    try {
      const data = await get<{ groupchat_link: string }>(
        "/api/admin/ukm/groupchat",
      );
      groupchatLink = data.groupchat_link;
    } catch (e: any) {
      error = "Failed to load group chat link.";
      Swal.fire({
        title: "Error!",
        text: "Failed to load group chat link.",
        icon: "error",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          container: 'admin-swal',
          popup: 'admin-swal-toast admin-swal-error',
          title: 'admin-swal-title',
          htmlContainer: 'admin-swal-html-container',
          icon: 'admin-swal-icon admin-swal-error',
        }
      });
    } finally {
      isLoading = false;
    }
  });

  function toggleEdit() {
    isEditing = !isEditing;
    error = null;
    success = null;
  }

  async function saveLink() {
    if (!groupchatLink.trim()) {
      error = "Please enter a valid group chat link.";
      return;
    }

    isLoading = true;
    error = null;
    success = null;

    try {
      await put("/api/admin/ukm/groupchat", { link: groupchatLink });

      success = "Group chat link has been updated.";
      isEditing = false; // Disable editing after successful save
    } catch (e: any) {
      error = "Failed to save link. Please try again.";
      Swal.fire({
        title: "Error!",
        text: `Failed to save link: ${JSON.parse(e.message).message}`,
        icon: "error",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          container: 'admin-swal',
          popup: 'admin-swal-toast admin-swal-error',
          title: 'admin-swal-title',
          htmlContainer: 'admin-swal-html-container',
          icon: 'admin-swal-icon admin-swal-error',
        }
      });
    } finally {
      isLoading = false;
    }
  }

  function copyToClipboard() {
    if (groupchatLink) {
      navigator.clipboard.writeText(groupchatLink);
      success = "Link copied to clipboard!";
      // Remove setTimeout as we're now using Swal toasts
      // setTimeout(() => success = null, 2000);
    }
  }

  // Add event listener to clear success message after showing toast
  $effect(() => {
    const clearSuccessHandler = () => {
      success = null;
    };
    
    window.addEventListener('clearGroupchatSuccess', clearSuccessHandler);
    
    return () => {
      window.removeEventListener('clearGroupchatSuccess', clearSuccessHandler);
    };
  });
</script>

<svelte:head>
  <title>OH Admin | Groupchat</title>
</svelte:head>

<!-- Admin Main Content Card -->
<main class="admin-card">
  <div class="admin-card-header mb-4 sm:mb-6">
    <div class="admin-card-title">
      <h2 class="text-lg font-semibold text-admin-text-primary mb-1">
        Group Chat Link
      </h2>
      <p class="text-sm text-admin-text-secondary">
        Manage the group chat link for participants
      </p>
    </div>
  </div>

  <div class="space-y-6">
    {#if isLoading && !groupchatLink}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-text-secondary"></div>
        <span class="ml-3 text-admin-text-secondary">Loading group chat link...</span>
      </div>
    {:else}
      <div class="border border-admin-border rounded-lg p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 class="text-base font-semibold text-admin-text-primary">Current Group Chat Link</h3>
            <p class="text-sm text-admin-text-secondary mt-1">
              {#if groupchatLink}
                This link will be shared with participants for group communication
              {:else}
                No group chat link has been set yet
              {/if}
            </p>
          </div>
          
          <div class="flex flex-wrap gap-2 w-full sm:w-auto">
            {#if groupchatLink}
              <button
                onclick={copyToClipboard}
                class="admin-btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9 .693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                <span class="sm:hidden">Copy</span>
                <span class="hidden sm:inline">Copy Link</span>
              </button>
            {/if}
            <button
              onclick={toggleEdit}
              class="admin-btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              disabled={isLoading}
            >
              {#if isEditing}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                <span class="sm:hidden">Cancel</span>
                <span class="hidden sm:inline">Cancel</span>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                <span class="sm:hidden">Edit</span>
                <span class="hidden sm:inline">Edit Link</span>
              {/if}
            </button>
          </div>
        </div>

        {#if error}
          <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <span class="ml-2 text-sm text-red-700">{error}</span>
            </div>
          </div>
        {/if}

        {#if success}
          {@html `<script>
            (function() {
              const successMessage = ${JSON.stringify(success)};
              if (successMessage) {
                Swal.fire({
                  title: "Success",
                  text: successMessage,
                  icon: "success",
                  toast: true,
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 3000,
                  customClass: {
                    container: 'admin-swal',
                    popup: 'admin-swal-toast admin-swal-success',
                    title: 'admin-swal-title',
                    htmlContainer: 'admin-swal-html-container',
                    icon: 'admin-swal-icon admin-swal-success',
                  }
                });
                // Clear success message after showing toast
                const event = new CustomEvent('clearGroupchatSuccess');
                window.dispatchEvent(event);
              }
            })();
          </script>`}
        {/if}

        {#if isEditing}
          <div class="space-y-4">
            <div>
              <label for="groupchatLink" class="block text-sm font-medium text-admin-text-primary mb-2">
                Group Chat Link
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 right-3 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-admin-text-tertiary">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                </div>
                <input
                  id="groupchatLink"
                  bind:value={groupchatLink}
                  class="admin-form-input pl-10 w-full"
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  disabled={isLoading}
                />
              </div>
              <p class="mt-2 text-xs text-admin-text-tertiary">
                Enter a valid WhatsApp, Telegram, or Discord group link
              </p>
            </div>

            <div class="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
              <button
                onclick={toggleEdit}
                class="admin-btn-secondary w-full sm:w-auto"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onclick={saveLink}
                disabled={isLoading}
                class="admin-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                {#if isLoading}
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                  Save Link
                {/if}
              </button>
            </div>
          </div>
        {:else}
          <div class="bg-admin-background rounded-lg border border-admin-border p-4">
            {#if groupchatLink}
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-admin-text-tertiary">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <p class="text-sm font-medium text-admin-text-primary break-all">{groupchatLink}</p>
                  <p class="mt-1 text-xs text-admin-text-secondary">
                    This link is currently active and will be shared with participants
                  </p>
                </div>
              </div>
            {:else}
              <div class="text-center py-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-admin-text-tertiary mx-auto">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                <h3 class="mt-3 text-sm font-medium text-admin-text-primary">No Group Chat Link Set</h3>
                <p class="mt-1 text-sm text-admin-text-secondary">
                  Click "Edit Link" to add a group chat link for participants
                </p>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</main>