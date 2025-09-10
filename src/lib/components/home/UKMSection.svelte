<script lang="ts">
	import { onMount } from 'svelte';

	const allBooks = [
		{ name: 'ASFS', src: '/ukm/book-asfs.webp' },
		{ name: 'Badminton', src: '/ukm/book-badminton.webp' },
		{ name: 'Basket', src: '/ukm/book-basket.webp' },
		{ name: 'Catur', src: '/ukm/book-catur.webp' },
		{ name: 'Chinese-Art', src: '/ukm/book-chinese-art.webp' },
		{ name: 'Dance', src: '/ukm/book-dance.webp' },
		{ name: 'Dekorasi', src: '/ukm/book-dekorasi.webp' },
		{ name: 'EMR', src: '/ukm/book-emr.webp' },
		{ name: 'English-Debate', src: '/ukm/book-english-debate.webp' },
		{ name: 'Futsal', src: '/ukm/book-futsal.webp' },
		{ name: 'Kyokushinkai', src: '/ukm/book-kyokushinkai.webp' },
		{ name: 'Martografi', src: '/ukm/book-martografi.webp' },
		{ name: 'Matrapala', src: '/ukm/book-matrapala.webp' },
		{ name: 'Matrapenza', src: '/ukm/book-matrapenza.webp' },
		{ name: 'Menwa', src: '/ukm/book-menwa.webp' },
		{ name: 'Modeling', src: '/ukm/book-modelling.webp' },
		{ name: 'Choir', src: '/ukm/book-pcu-choir.webp' },
		{ name: 'Orkestra', src: '/ukm/book-pcu-orchestra.webp' },
		{ name: 'Esports', src: '/ukm/book-petra-esports.webp' },
		{ name: 'PD', src: '/ukm/book-pd.webp' },
		{ name: 'Renang', src: '/ukm/book-renang.webp' },
		{ name: 'Taekwondo', src: '/ukm/book-taekwondo.webp' },
		{ name: 'Teater', src: '/ukm/book-teater.webp' },
		{ name: 'Tenis-Meja', src: '/ukm/book-tenis-meja.webp' },
		{ name: 'VG', src: '/ukm/book-vg.webp' },
		{ name: 'Voli', src: '/ukm/book-voli.webp' }
	];

	const topRowBooks = allBooks.slice(0, 13);
	const bottomRowBooks = allBooks.slice(13);
	const createSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
	
	// let activeTopBookName: string | null = topRowBooks[0]?.name || null;
	// let activeBottomBookName: string | null = bottomRowBooks[0]?.name || null;
	let activeTopBookName: string | null = null;
	let activeBottomBookName: string | null = null;

	let topRowContainer: HTMLDivElement;
	let bottomRowContainer: HTMLDivElement;
	let isMobile = false;
	let ticking = false;

	// store last scroll position, detect direction.
	let lastScrollTop = 0;
	let lastScrollBottom = 0;

	const updateActiveBookByPosition = (
		container: HTMLDivElement,
		setActiveBook: (name: string) => void,
		positionRatio: number
	) => {
		if (!container || !isMobile) return;
		const containerRect = container.getBoundingClientRect();
		const targetPoint = containerRect.left + containerRect.width * positionRatio;
		let closest = { name: '', distance: Infinity };
		const bookElements = container.querySelectorAll('a');
		bookElements.forEach((bookEl) => {
			const bookRect = bookEl.getBoundingClientRect();
			const bookCenter = bookRect.left + bookRect.width / 2;
			const distance = Math.abs(targetPoint - bookCenter);
			if (distance < closest.distance) {
				closest.distance = distance;
				closest.name = bookEl.title;
			}
		});
		setActiveBook(closest.name);
	};

	// update handlers
	const handleScrollTop = () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const currentScroll = topRowContainer.scrollLeft;
				let positionRatio = 0.15;

				if (currentScroll > lastScrollTop) {
					positionRatio = 0.85;
				}
				
				updateActiveBookByPosition(
					topRowContainer,
					(name) => { activeTopBookName = name; },
					positionRatio
				);
				
				lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
				ticking = false;
			});
			ticking = true;
		}
	};

	const handleScrollBottom = () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const currentScroll = bottomRowContainer.scrollLeft;
				let positionRatio = 0.15;

				if (currentScroll > lastScrollBottom) {
					positionRatio = 0.85;
				}

				updateActiveBookByPosition(
					bottomRowContainer,
					(name) => { activeBottomBookName = name; },
					positionRatio
				);
				
				lastScrollBottom = currentScroll <= 0 ? 0 : currentScroll;
				ticking = false;
			});
			ticking = true;
		}
	};

	const checkIsMobile = () => {
		isMobile = window.innerWidth < 1280;
	};
	onMount(() => {
		checkIsMobile();
		window.addEventListener('resize', checkIsMobile);
		if (topRowContainer) {
			topRowContainer.addEventListener('scroll', handleScrollTop, { passive: true });
		}
		if (bottomRowContainer) {
			bottomRowContainer.addEventListener('scroll', handleScrollBottom, { passive: true });
		}
		return () => {
			window.removeEventListener('resize', checkIsMobile);
			if (topRowContainer) {
				topRowContainer.removeEventListener('scroll', handleScrollTop);
			}
			if (bottomRowContainer) {
				bottomRowContainer.removeEventListener('scroll', handleScrollBottom);
			}
		};
	});
</script>

<section
	class="relative w-full h-[80vh] md:h-[80vh] xl:h-[150vh] 4xl:h-[200vh] mt-[-10vw] xl:mt-[-20vw]"
>
    <div class="absolute inset-0 w-full h-full">
        
        <div
			class="absolute bottom-0 left-0 right-0 bg-cover bg-center 
                   top-[4%] sm:top-[6%] xl:top-[26%] z-0"
			style="background-image: url('/ukm/bookshelf-wall.webp');"
		></div>
        <img
			src="/ukm/book-floor.webp"
			alt=""
			class="absolute bottom-[0%] xl:left-1/2 -translate-x-1/2 max-w-none w-[200%] xl:w-full z-10"
		/>
		<img
			src="/ukm/book-floor.webp"
			alt=""
			class="absolute top-[52%] md:top-[43%] xl:top-[58%] 2xl:top-[58%] left-1/2 -translate-x-1/2 max-w-none w-[200%] xl:w-full z-30"
		/>
		<img
			src="/ukm/bookshelf-top.webp"
			alt="Bookshelf top"
			class="absolute top-[4%] sm:top-[6%] xl:top-[26%] left-1/2 -translate-x-1/2 max-w-none w-[280%] md:w-[170%] xl:w-[100%] z-50"
		/>
	</div>

	<div class="relative w-full h-full">
		<div
			bind:this={topRowContainer}
			class="absolute top-[26%] md:top-[22%] xl:top-[40%] h-[40%] xl:h-[30%] w-full z-40
                   overflow-x-auto xl:overflow-visible scrollbar-hide"
		>
			<div
				class="flex items-end h-full w-max xl:w-[65%] gap-x-0 px-4 pb-8 xl:pb-0 xl:mx-auto xl:justify-center"
			>
				{#each topRowBooks as book (book.name)}
					<a
						href="/ukm/{createSlug(book.name)}"
						class="flex-shrink-0 h-[30vh] xl:h-full transition-transform duration-300 ease-in-out
                               xl:hover:translate-y-8"
						class:translate-y-8={isMobile && activeTopBookName === book.name}
						title={book.name}
					>
						<img src={book.src} alt={book.name} class="h-full w-auto" />
					</a>
				{/each}
			</div>
		</div>

		<div
			bind:this={bottomRowContainer}
			class="absolute bottom-[0%] sm:bottom-[4%] h-[40%] xl:h-[30%] w-full z-20
                   overflow-x-auto xl:overflow-visible scrollbar-hide"
		>
			<div
				class="flex items-end h-full w-max xl:w-[65%] gap-x-0 px-4 pb-8 xl:pb-0 xl:mx-auto xl:justify-center"
			>
				{#each bottomRowBooks as book (book.name)}
					<a
						href="/ukm/{createSlug(book.name)}"
						class="flex-shrink-0 h-[30vh] xl:h-full transition-transform duration-300 ease-in-out
                               xl:hover:translate-y-8"
						class:translate-y-8={isMobile && activeBottomBookName === book.name}
						title={book.name}
					>
						<img src={book.src} alt={book.name} class="h-full w-auto" />
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>