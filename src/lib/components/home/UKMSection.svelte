<script lang="ts">
	import { onMount } from 'svelte';

	const allBooks = [
		{ name: 'ASFS', src: '/svg/home/ukm/books/book asfs.svg' },
		{ name: 'Badminton', src: '/svg/home/ukm/books/book badminton.svg' },
		{ name: 'Basket', src: '/svg/home/ukm/books/book basket.svg' },
		{ name: 'Catur', src: '/svg/home/ukm/books/book catur.svg' },
		{ name: 'Chinese Art', src: '/svg/home/ukm/books/book chinese art.svg' },
		{ name: 'Choir', src: '/svg/home/ukm/books/book choir.svg' },
		{ name: 'Dance', src: '/svg/home/ukm/books/book dance.svg' },
		{ name: 'Dekorasi', src: '/svg/home/ukm/books/book dekorasi.svg' },
		{ name: 'EMR', src: '/svg/home/ukm/books/book emr.svg' },
		{ name: 'English Debate', src: '/svg/home/ukm/books/book english debate.svg' },
		{ name: 'Esports', src: '/svg/home/ukm/books/book esports.svg' },
		{ name: 'Futsal', src: '/svg/home/ukm/books/book futal.svg' },
		{ name: 'Kyokushinkai', src: '/svg/home/ukm/books/book illustrasi.svg' },
		{ name: 'Martografi', src: '/svg/home/ukm/books/book martografi.svg' },
		{ name: 'Matrapala', src: '/svg/home/ukm/books/book matrapala.svg' },
		{ name: 'Matrapenza', src: '/svg/home/ukm/books/book matrapenza.svg' },
		{ name: 'Menwa', src: '/svg/home/ukm/books/book menwa.svg' },
		{ name: 'Modelling', src: '/svg/home/ukm/books/book modelling.svg' },
		{ name: 'Orchestra', src: '/svg/home/ukm/books/book orchestra.svg' },
		{ name: 'PD', src: '/svg/home/ukm/books/book pd.svg' },
		{ name: 'Renang', src: '/svg/home/ukm/books/book renang.svg' },
		{ name: 'Taekwondo', src: '/svg/home/ukm/books/book taekwondo.svg' },
		{ name: 'Teater', src: '/svg/home/ukm/books/book teater.svg' },
		{ name: 'Tenis Meja', src: '/svg/home/ukm/books/book tenis meja.svg' },
		{ name: 'VG', src: '/svg/home/ukm/books/book vg.svg' },
		{ name: 'Voli', src: '/svg/home/ukm/books/book voli.svg' }
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
			style="background-image: url('/svg/home/ukm/wall behind.svg');"
		></div>
        <img
			src="/svg/home/ukm/book floor.svg"
			alt=""
			class="absolute bottom-[0%] xl:left-1/2 -translate-x-1/2 max-w-none w-[200%] xl:w-full z-10"
		/>
		<img
			src="/svg/home/ukm/book floor.svg"
			alt=""
			class="absolute top-[52%] md:top-[43%] xl:top-[58%] 2xl:top-[58%] left-1/2 -translate-x-1/2 max-w-none w-[200%] xl:w-full z-30"
		/>
		<img
			src="/svg/home/ukm/planks.svg"
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