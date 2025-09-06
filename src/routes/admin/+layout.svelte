<script lang="ts">
  // Get admin data from server load and children
  let { data, children }: { data: PageData; children: Snippet } = $props();
  import { PUBLIC_API_BASE } from "$env/static/public";
  import { get, getSessionValues } from "$lib/api";
  import { onMount, type Snippet } from "svelte";
  import { slide } from "svelte/transition";
  import Swal from "sweetalert2";
  import type { PageData } from "./$types";
  import { Users, Grid3X3, MessageSquare, Menu, X, LogOut } from "lucide-svelte";

  let adminData: Record<string, any> = $state({});
  let manageUKM = $state(false);
  // Check if admin has an UKM
  onMount(async () => {
    try {
      adminData = await getSessionValues([
        "admin_ukm_id",
        "admin_ukm_name",
        "admin_division_slug",
      ]);
      await get<{ groupchat_link: string }>("/api/admin/ukm/groupchat");
      manageUKM = true;
    } catch (e: any) {}
  });

  let isMenuOpen = $state(false);

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  async function handleLogout() {
    try {
      const response = await fetch(`${PUBLIC_API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
        Swal.fire({
          icon: "error",
          title: "Logout Failed",
          text: "There was an error logging out. Please try again.",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "There was an error logging out. Please try again.",
      });
    }
  }
</script>

<div
  class="admin-layout font-lexend flex h-screen flex-col md:flex-row"
>
  <nav
    class="admin-sidebar inset-y-0 min-w-64 flex-col bg-white border-r border-admin-border md:fixed md:flex md:max-w-64"
  >
    <button
      class="admin-menu-toggle float-right m-6 p-2 hover:bg-admin-hover transition-colors md:hidden"
      onclick={toggleMenu}
      aria-label="Toggle menu"
      aria-expanded={isMenuOpen}
    >
      {#if isMenuOpen}
        <X class="w-5 h-5 text-admin-text-secondary" />
      {:else}
        <Menu class="w-5 h-5 text-admin-text-secondary" />
      {/if}
    </button>

    <!--  Mobile view  -->
    {#if isMenuOpen}
      <div
        class="flex h-full w-full flex-col"
        class:nav-mobile-open={isMenuOpen}
        class:nav-mobile-closed={!isMenuOpen}
        transition:slide
      >
        <div class="flex h-full flex-col md:justify-between">
          <div class="admin-panel-title mx-6 py-4 border-b border-admin-border">
            <h2 class="text-lg font-semibold text-admin-text-primary">
              Open House 2025
            </h2>
            <p class="text-sm text-admin-text-secondary">
              Admin Panel
            </p>
          </div>
          
          <ul class="mt-4">
            <li>
              <a
                href="/admin/"
                class="admin-nav-item mx-6 flex items-center gap-3 py-3 px-4 rounded-lg transition-colors hover:bg-admin-hover"
                aria-label="Participants"
              >
                <span class="admin-nav-icon">
                  <Users class="w-5 h-5" />
                </span>
                <span class="admin-nav-text">Participants</span>
              </a>
            </li>
            {#if adminData.admin_division_slug === "bph" || adminData.admin_division_slug === "it"}
              <li>
                <a
                  href="/admin/ukm"
                  class="admin-nav-item mx-6 flex items-center gap-3 py-3 px-4 rounded-lg transition-colors hover:bg-admin-hover"
                  aria-label="Manage UKM"
                >
                  <span class="admin-nav-icon">
                    <Grid3X3 class="w-5 h-5" />
                  </span>
                  <span class="admin-nav-text">Manage UKM</span>
                </a>
              </li>
            {/if}
            {#if manageUKM}
              <li>
                <a
                  href="/admin/groupchat"
                  class="admin-nav-item mx-6 flex items-center gap-3 py-3 px-4 rounded-lg transition-colors hover:bg-admin-hover"
                  aria-label="Group Chat"
                >
                  <span class="admin-nav-icon">
                    <MessageSquare class="w-5 h-5" />
                  </span>
                  <span class="admin-nav-text">Group Chat</span>
                </a>
              </li>
            {/if}
          </ul>
          <div class="admin-user-section mx-6 p-4 border-t border-admin-border">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex flex-col">
                  <span class="admin-user-name text-sm font-medium text-admin-text-primary">{data.admin.name}</span>
                  <span class="admin-user-nrp text-xs text-admin-text-secondary">{data.admin.nrp}</span>
                </div>
                <span class="admin-status-indicator relative flex h-2 w-2">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-admin-success opacity-75"></span>
                  <span class="relative inline-flex h-2 w-2 rounded-full bg-admin-success"></span>
                </span>
              </div>

              <button 
                onclick={handleLogout} 
                aria-label="logout"
                class="admin-logout-btn p-2 hover:bg-admin-hover rounded-lg transition-colors"
              >
                <LogOut class="w-4 h-4 text-admin-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!--Desktop view-->
    <div class="hidden h-full flex-col md:flex py-6">
      <div class="flex h-full flex-col justify-between">
        <div class="admin-panel-title mx-6 mb-6 pb-4 border-b border-admin-border">
          <h2 class="text-lg font-semibold text-admin-text-primary">
            Open House 2025
          </h2>
          <p class="text-sm text-admin-text-secondary">
            Admin Panel
          </p>
        </div>
        
        <ul class="space-y-2">
          <li>
            <a
              href="/admin/"
              class="admin-nav-item mx-6 flex items-center gap-3 py-3 px-4 rounded-lg transition-colors hover:bg-admin-hover"
              aria-label="Participants"
            >
              <span class="admin-nav-icon">
                <Users class="w-5 h-5" />
              </span>
              <span class="admin-nav-text">Participants</span>
            </a>
          </li>
          {#if adminData.admin_division_slug === "bph" || adminData.admin_division_slug === "it"}
            <li>
              <a
                href="/admin/ukm"
                class="admin-nav-item mx-6 flex items-center gap-3 py-3 px-4 rounded-lg transition-colors hover:bg-admin-hover"
                aria-label="Manage UKM"
              >
                <span class="admin-nav-icon">
                  <Grid3X3 class="w-5 h-5" />
                </span>
                <span class="admin-nav-text">Manage UKM</span>
              </a>
            </li>
          {/if}
          {#if manageUKM}
            <li>
              <a
                href="/admin/groupchat"
                class="admin-nav-item mx-6 flex items-center gap-3 py-3 px-4 rounded-lg transition-colors hover:bg-admin-hover"
                aria-label="Group Chat"
              >
                <span class="admin-nav-icon">
                  <MessageSquare class="w-5 h-5" />
                </span>
                <span class="admin-nav-text">Group Chat</span>
              </a>
            </li>
          {/if}
        </ul>
        <div class="admin-user-section mx-6 p-4 border-t border-admin-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="flex flex-col">
                <span class="admin-user-name text-sm font-medium text-admin-text-primary truncate max-w-32">{data.admin.name}</span>
                <span class="admin-user-nrp text-xs text-admin-text-secondary">{data.admin.nrp}</span>
              </div>
              <span class="admin-status-indicator relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-admin-success opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-admin-success"></span>
              </span>
            </div>

            <button 
              onclick={handleLogout} 
              aria-label="logout"
              class="admin-logout-btn p-2 hover:bg-admin-hover rounded-lg transition-colors"
            >
              <LogOut class="w-4 h-4 text-admin-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <main class="admin-main flex w-full flex-col p-6 md:ml-64 bg-admin-background min-h-screen">
    <div class="admin-content max-w-7xl mx-auto w-full">
      {@render children()}
    </div>
  </main>
</div>

<style>
  .nav-mobile-closed {
    max-height: 0;
    overflow: hidden;
    /* We add opacity for a smoother fade effect alongside the slide */
    opacity: 0;
  }
  .nav-mobile-open {
    opacity: 1;
  }
</style>
