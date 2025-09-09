<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { getCurrentUserInfo } from '$lib/api';

	const user = writable<any>(null);
	let isVisible = true;
	let lastScrollY = 0;
	let isSidebarOpen = false;
	let programmaticScroll = false;

	onMount(() => {
		async function checkUser() {
			try {
				const userInfo = await getCurrentUserInfo();
				user.set(userInfo);
			} catch (error) {
				user.set(null);
			}
		}
		checkUser();

		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			if (programmaticScroll) {
				lastScrollY = currentScrollY;
				return;
			}

			if (currentScrollY <= 100) {
				isVisible = true;
			} else {
				isVisible = currentScrollY < lastScrollY;
			}
			lastScrollY = currentScrollY;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});




    function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function handleNavClick() {
		programmaticScroll = true;
		isVisible = true;

		setTimeout(() => {
			programmaticScroll = false;
		}, 1000);
	}

	async function handleMobileLinkClick() {
		handleNavClick();
		isSidebarOpen = false;
		await tick();
	}
</script>

<nav
	class="fixed top-0 left-0 right-0 z-[100] px-4 sm:px-6 transition-transform duration-500 ease-in-out"
	class:translate-y-0={isVisible}
	class:-translate-y-full={!isVisible}
>
	<div class="container mx-auto flex justify-between items-center">
		<div class="group relative flex items-center z-10">
			<a href="/#hero" on:click={handleNavClick} aria-label="Go to homepage hero section">
				<img
					src="/png/openhouse logo.png"
					alt="OpenHouse 2025 Logo"
					class="w-24 md:w-32 transition-transform hover:rotate-[-5deg] drop-shadow-[0_4px_8px_rgba(96,0,0,0.35)]"
				/>
			</a>
			<div
				class="logo-text-container absolute left-[90%] md:left-full ml-1 flex whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
			>
				{#each 'OPENHOUSE'.split('') as letter, i}
					<span
						class="font-moomello text-5xl md:text-5xl bg-gradient-to-tr from-[#F6BABC] via-[#FEF7EB] to-white bg-clip-text text-transparent drop-shadow-[0_5px_15px_rgba(96,0,0,0.45)]"
						style="transition-delay: {i * 50}ms;"
					>
						{letter}
					</span>
				{/each}
			</div>
		</div>
		<div class="hidden lg:block">
			<div
				class="p-0.5 rounded-full bg-gradient-to-t from-[var(--button-outline-primary)] to-[var(--button-outline-secondary)] shadow-lg"
			>
				<div
					class="flex items-center gap-x-5 rounded-full px-6 py-2 bg-gradient-to-r from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)]"
				>
					<a
						href="/#ukm"
						on:click={handleNavClick}
						class="font-spicyrice text-xl font-light bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
						>UKM</a
					>
					<div
						class="w-2 h-2 rounded-full bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)]"
					></div>
					<a
						href="/#lk"
						on:click={handleNavClick}
						class="font-spicyrice text-xl font-light bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
						>LK - KBM</a
					>
					<div
						class="w-2 h-2 rounded-full bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)]"
					></div>
					<a
						href="/#faq"
						on:click={handleNavClick}
						class="font-spicyrice text-xl font-light bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
						>FAQ</a
					>
					<div
						class="w-2 h-2 rounded-full bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)]"
					></div>
					<a
						href="#"
						on:click={handleNavClick}
						class="font-spicyrice text-xl font-light bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
						>Contact</a
					>
				</div>
			</div>
		</div>
		<div class="hidden lg:block">
			{#if $user}
				<a
					href="/registration"
					class="px-6 py-3 font-bold text-[var(--text-dark)] rounded-full text-lg transition-transform hover:scale-105 bg-gradient-to-t from-[var(--bg-light-primary)] to-[var(--bg-light-secondary)] shadow-md"
				>
					Register
				</a>
			{:else}
				<a
					href="/login"
					class="px-6 py-3 font-bold text-[var(--text-dark)] rounded-full text-lg transition-transform hover:scale-105 bg-gradient-to-t from-[var(--bg-light-primary)] to-[var(--bg-light-secondary)] shadow-md"
				>
					Login
				</a>
			{/if}
		</div>
		<div class="lg:hidden z-10">
			<button
				on:click={toggleSidebar}
				aria-label="Open menu"
				class="p-0.5 rounded-lg bg-gradient-to-t from-[var(--button-outline-primary)] to-[var(--button-outline-secondary)]"
			>
				<span
					class="block rounded-md px-2 py-2 bg-gradient-to-r from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)]"
				>
					<svg class="h-6 w-6" viewBox="0 0 24 24" stroke="url(#gold-gradient)" stroke-width="2.5">
						<defs>
							<linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
								<stop offset="0%" style="stop-color:var(--color-off-white);" />
								<stop offset="100%" style="stop-color:var(--color-light-gold);" />
							</linearGradient>
						</defs>
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-8 6h8" />
					</svg>
				</span>
			</button>
		</div>
	</div>
</nav>

{#if isSidebarOpen}
	<div
		transition:fly={{ duration: 300, opacity: 0 }}
		on:click={toggleSidebar}
		on:keydown
		role="button"
		tabindex="0"
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
	></div>

	<!-- <aside
		transition:fly={{ duration: 400, x: '100%', easing: quintOut }}
		class="fixed top-0 right-0 h-full w-64 p-6 flex flex-col shadow-2xl z-[120] bg-gradient-to-tl from-[var(--bg-dark-primary)] via-[var(--bg-dark-secondary)] to-[var(--bg-dark-tertiary)]"
	> -->
    <aside
		transition:fly={{ duration: 400, x: '100%', easing: quintOut }}
        class="fixed top-0 right-0 h-[100lvh] w-64 p-6 flex flex-col shadow-2xl z-[120] bg-gradient-to-b from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)]"

	>
		<div class="flex justify-end -mr-2 -mt-2">
			<button on:click={toggleSidebar} aria-label="Close menu" class="p-2">
				<svg
					class="w-6 h-6 text-white/70 hover:text-white/100 transition-colors"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2.5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="w-full text-center my-12">
			<a href="/#hero" on:click={handleMobileLinkClick} class="inline-block">
				<div class="flex justify-center whitespace-nowrap">
					{#each 'OPENHOUSE'.split('') as letter, i}
						<span class="sidebar-title-letter" style="animation-delay: {50 + i * 50}ms;"
							>{letter}</span
						>
					{/each}
				</div>
			</a>
		</div>

		<hr class="sidebar-divider my-4" />

		<div class="flex flex-col items-center gap-4">
			<a href="/#ukm" on:click={handleMobileLinkClick} class="sidebar-nav-link">
				<div class="sidebar-nav-link-inner">
					<div class="sidebar-nav-link-circle"></div>
					<span class="sidebar-nav-link-text">UKM</span>
					<div class="sidebar-nav-link-circle"></div>
				</div>
			</a>
			<a href="/#lk" on:click={handleMobileLinkClick} class="sidebar-nav-link">
				<div class="sidebar-nav-link-inner">
					<div class="sidebar-nav-link-circle"></div>
					<span class="sidebar-nav-link-text">LK - KBM</span>
					<div class="sidebar-nav-link-circle"></div>
				</div>
			</a>
			<a href="/#faq" on:click={handleMobileLinkClick} class="sidebar-nav-link">
				<div class="sidebar-nav-link-inner">
					<div class="sidebar-nav-link-circle"></div>
					<span class="sidebar-nav-link-text">FAQ</span>
					<div class="sidebar-nav-link-circle"></div>
				</div>
			</a>
			<a href="#" on:click={handleMobileLinkClick} class="sidebar-nav-link">
				<div class="sidebar-nav-link-inner">
					<div class="sidebar-nav-link-circle"></div>
					<span class="sidebar-nav-link-text">Contact</span>
					<div class="sidebar-nav-link-circle"></div>
				</div>
			</a>
		</div>

		<hr class="sidebar-divider my-4" />

		<div>
			{#if $user}
				<a
					href="/registration"
					class="block w-full text-center px-6 py-3 font-bold text-[var(--text-dark)] rounded-full text-lg transition-transform hover:scale-105 bg-gradient-to-t from-[var(--bg-light-primary)] to-[var(--bg-light-secondary)]"
				>
					Register
				</a>
			{:else}
				<a
					href="/login"
					class="block w-full text-center px-6 py-3 font-bold text-[var(--text-dark)] rounded-full text-lg transition-transform hover:scale-105 bg-gradient-to-t from-[var(--bg-light-primary)] to-[var(--bg-light-secondary)]"
				>
					Login
				</a>
			{/if}
		</div>
	</aside>
{/if}

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	.logo-text-container span {
		display: inline-block;
		opacity: 0;
		transform: translateY(15px);
		transition:
			opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
			transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}
	.group:hover .logo-text-container span {
		opacity: 1;
		transform: translateY(0);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.sidebar-title-letter {
		font-family: 'Moomello', sans-serif;
		font-size: 3.5rem;
		line-height: 1;
		background-image: linear-gradient(to top right, #f6babc, #fef7eb, white);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: fadeInUp 0.6s ease-out forwards;
		opacity: 0;
	}
	.sidebar-divider {
		width: 100%;
		height: 1px;
		border: none;
		background-image: linear-gradient(
			to right,
			transparent,
			var(--color-light-gold),
			transparent
		);
		opacity: 0.4;
	}
	.sidebar-nav-link {
		display: block;
		width: 100%;
		padding: 2px;
		border-radius: 9999px;
		background-image: linear-gradient(
			to top,
			var(--button-outline-primary),
			var(--button-outline-secondary)
		);
		transition: transform 0.2s ease-out;
	}
	.sidebar-nav-link:hover {
		transform: scale(1.05);
	}
	.sidebar-nav-link-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.4rem 1rem;
		border-radius: 9999px;
		background-image: linear-gradient(
			to right,
			var(--button-violet-primary),
			var(--button-violet-secondary),
			var(--button-violet-primary)
		);
	}
	.sidebar-nav-link-text {
		font-family: 'Spicy Rice', cursive;
		font-size: 1.125rem;
		font-weight: 300;
		background-image: linear-gradient(to top, var(--color-light-gold), var(--color-off-white));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.sidebar-nav-link-circle {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		background-image: linear-gradient(to top, var(--color-light-gold), var(--color-off-white));
		flex-shrink: 0;
	}
</style>