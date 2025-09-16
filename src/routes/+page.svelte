<script>
	import HeroB from '$lib/components/home/HeroB.svelte';
	import LKSection from '$lib/components/home/Lk.svelte';
	import UkmSection from '$lib/components/home/UKMSection.svelte';
	import Faq from '$lib/components/home/Faq.svelte';
	import Swal from '$lib/components/swal/swal.svelte';
	import ColorPalette from '$lib/components/home/ColorPalette.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
</script>

<svelte:head>
	<title>Open House 2025 - Home</title>
</svelte:head>

<Swal />
<Navbar />

<main class="relative overflow-x-hidden">
	<div class="relative">
		<div id="hero" class="overflow-hidden">
			<HeroB />
		</div>
		<img src="/home/stage-bottom.webp" alt="Stage bottom" 
			class="absolute -bottom-30 sm:-bottom-20 md:-bottom-40 lg:-bottom-52 xl:-bottom-40 
					left-1/2 -translate-x-1/2 max-w-none 
					w-[300%] sm:w-[130%] md:w-[200%] lg:w-[150%] xl:w-[101%] z-[60]" />
	</div>

	<div id="ukm" class="z-10">
		<UkmSection />
	</div>
	<div id="lk">
		<LKSection />
	</div>
	<div class="z-20 h-screen sticky top-0 -mt-[100vh]" id="faq">
		<Faq />
		<!-- <Footer />  -->
	</div>

	<div id="contact">
		<Footer /> 	
	</div>
</main>

<style>
	main {
		display: block;
	}
</style>