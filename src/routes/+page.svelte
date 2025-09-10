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

<Swal />
<Navbar />

<main class="relative overflow-x-hidden">
	<div id="hero">
		<HeroB />
	</div>
	<div id="ukm">
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