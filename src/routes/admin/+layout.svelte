<script lang="ts">
  // Get admin data from server load and children
  let { data, children }: { data: PageData; children: Snippet } = $props();
  import { PUBLIC_API_BASE } from "$env/static/public";
  import { get } from "$lib/api";
  import { onMount, type Snippet } from "svelte";
  import { slide } from "svelte/transition";
  import logoSmall from "$lib/images/logo_oh_small.png";
  import Swal from "sweetalert2";
  import type { PageData } from "./$types";

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
  class="font-plus-jakarta-sans flex h-screen flex-col gap-4 transition-all md:flex-row"
>
  <nav
    class="inset-y-0 min-w-64 flex-col gap-6 bg-white text-sm font-semibold text-nowrap text-gray-800 shadow-lg md:fixed md:flex md:max-w-64"
  >
    <button
      class="float-right m-4 md:hidden"
      onclick={toggleMenu}
      aria-label="Toggle menu"
      aria-expanded={isMenuOpen}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        {#if isMenuOpen}
          <!-- X icon for closing -->
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        {:else}
          <!-- Hamburger icon for opening -->
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        {/if}
      </svg>
    </button>

    <!--  Mobile view  -->
    {#if isMenuOpen}
      <div
        class="flex h-full w-full flex-col"
        class:nav-mobile-open={isMenuOpen}
        class:nav-mobile-closed={!isMenuOpen}
        transition:slide
      >
        <div class="flex">
          <img src={logoSmall} alt="Logo" class="ms-8 w-32" />
        </div>
        <div class="flex h-full flex-col md:justify-between">
          <ul>
            <li>
              <a
                href="/admin/"
                class="ms-4 flex items-center gap-2 p-4"
                aria-label="Users"
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="size-6"
                  >
                    <path
                      d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z"
                    />
                  </svg>
                </span>
                <span>Participants</span>
              </a>
            </li>
            <li>
              <a
                href="/admin/groupchat"
                class="ms-4 flex items-center gap-2 p-4"
                aria-label="Users"
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="size-6"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
                      clip-rule="evenodd"
                    />
                    <path
                      d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z"
                    />
                  </svg>
                </span>
                <span>Link Group Chat</span>
              </a>
            </li>
          </ul>
          <div class="ms-4 flex items-center justify-between p-4">
            <div class="flex">
              Admin {data.admin.name} ({data.admin.nrp})
              <span class="relative flex size-3">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"
                ></span>
                <span
                  class="relative inline-flex size-3 rounded-full bg-green-400"
                ></span>
              </span>
            </div>

            <button onclick={handleLogout} aria-label="logout">
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
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!--Desktop view-->
    <div class="hidden h-full flex-col md:flex">
      <div class="flex justify-center">
        <img src={logoSmall} alt="Logo" class="w-48" />
      </div>
      <div class="flex h-full flex-col md:justify-between">
        <ul>
          <li>
            <a
              href="/admin/"
              class="ms-4 flex items-center gap-2 p-4"
              aria-label="Users"
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="size-6"
                >
                  <path
                    d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z"
                  />
                </svg>
              </span>
              <span>Participants</span>
            </a>
          </li>
          <li>
            <a
              href="/admin/groupchat"
              class="ms-4 flex items-center gap-2 p-4"
              aria-label="Users"
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="size-6"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
                    clip-rule="evenodd"
                  />
                  <path
                    d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z"
                  />
                </svg>
              </span>
              <span>Link Group Chat</span>
            </a>
          </li>
        </ul>
        <div class="ms-4 flex justify-between p-4">
          <div class="flex">
            <div class="max-w-40 truncate">
              {data.admin.name} ({data.admin.nrp})
            </div>
            <span class="relative flex size-3">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"
              ></span>
              <span
                class="relative inline-flex size-3 rounded-full bg-green-400"
              ></span>
            </span>
          </div>

          <button onclick={handleLogout} aria-label="logout">
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
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
  <main class="flex w-full flex-col gap-6 p-6 md:ms-64">
    {@render children()}
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
  .nav-content {
    /* Apply transitions for a smooth animation */
    transition:
      max-height 0.3s ease-in-out,
      opacity 0.3s ease-in-out;
  }
</style>
