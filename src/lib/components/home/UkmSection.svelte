<script lang="ts">
	const allBooks = [
		{ name: 'ASFS', src: '/svg/home/ukm/books/book asfs.svg' },
		{ name: 'Badminton', src: '/svg/home/ukm/books/book badminton.svg' },
		{ name: 'Basket', src: '/svg/home/ukm/books/book basket.svg' },
		{ name: 'Catur', src: '/svg/home/ukm/books/book catur.svg' },
		{ name: 'Choir', src: '/svg/home/ukm/books/book choir.svg' },
		{ name: 'Cycling', src: '/svg/home/ukm/books/book cycling.svg' },
		{ name: 'Dance', src: '/svg/home/ukm/books/book dance.svg' },
		{ name: 'Dekorasi', src: '/svg/home/ukm/books/book dekorasi.svg' },
		{ name: 'Diving', src: '/svg/home/ukm/books/book diving.svg' },
		{ name: 'EMR', src: '/svg/home/ukm/books/book emr.svg' },
		{ name: 'English Debate', src: '/svg/home/ukm/books/book english debate.svg' },
		{ name: 'Futsal', src: '/svg/home/ukm/books/book futal.svg' },
		{ name: 'Illustrasi', src: '/svg/home/ukm/books/book illustrasi.svg' },
		{ name: 'Martografi', src: '/svg/home/ukm/books/book martografi.svg' },
		{ name: 'Matrapala', src: '/svg/home/ukm/books/book matrapala.svg' },
		{ name: 'Menulis Kreatif', src: '/svg/home/ukm/books/book menulis kreatif.svg' },
		{ name: 'Modelling', src: '/svg/home/ukm/books/book modelling.svg' },
		{ name: 'Orchestra', src: '/svg/home/ukm/books/book orchestra.svg' },
		{ name: 'PD', src: '/svg/home/ukm/books/book pd.svg' },
		{ name: 'Renang', src: '/svg/home/ukm/books/book renang.svg' },
		{ name: 'Taekwondo', src: '/svg/home/ukm/books/book taekwondo.svg' },
		{ name: 'Teater', src: '/svg/home/ukm/books/book teater.svg' },
		{ name: 'Tenis Meja', src: '/svg/home/ukm/books/book tenis meja.svg' },
		{ name: 'Tenis', src: '/svg/home/ukm/books/book tenis.svg' },
		{ name: 'VG', src: '/svg/home/ukm/books/book vg.svg' },
		{ name: 'Voli', src: '/svg/home/ukm/books/book voli.svg' }
	];
	const topRowBooks = allBooks.slice(0, 13);
	const bottomRowBooks = allBooks.slice(13);
	const createSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
</script>

<section
  class="relative w-full h-[80vh] lg:h-[150vh] max-h-[1200px] mt-[-10vw] bg-cover bg-center"
  style="background-image: url('/svg/home/ukm/wall behind.svg');"
>
	<div class="absolute inset-0 w-full h-full">
		<!-- <img
			src="/svg/home/ukm/wall behind.svg"
			alt="Bookshelf wall"
			class="absolute inset-0 w-full h-full object-cover z-0"
		/> -->
		<img
			src="/svg/home/ukm/floor.svg"
			alt=""
			class="absolute bottom-[0%] left-1/2 -translate-x-1/2 max-w-none w-[110%] lg:w-full z-10"
		/>
		<img
			src="/svg/home/ukm/floor.svg"
			alt=""
			class="absolute top-[44%] lg:top-[37%] left-1/2 -translate-x-1/2 max-w-none w-[110%] lg:w-full z-30"
		/>
		<!-- <img
			src="/svg/home/ukm/shelf wall L.svg"
			alt=""
			class="hidden lg:block absolute left-0 bottom-0 h-full z-50"
		/>
		<img
			src="/svg/home/ukm/shelf wall R.svg"
			alt=""
			class="hidden lg:block absolute right-0 bottom-0 h-full z-50"
		/> -->
		<img
			src="/svg/home/ukm/bookshelf top.svg"
			alt="Bookshelf top"
			class="absolute top-10 lg:top-44 left-1/2 -translate-x-1/2 max-w-none w-[200%] lg:w-[120%] z-50"
		/>
	</div>

	<div class="relative w-full h-full">
		<div
			class="absolute top-[15%] lg:top-[40%] h-[40%] lg:h-[30%] w-full z-40
                   overflow-x-auto lg:overflow-visible scrollbar-hide"
		>
			<div
				class="flex items-end h-full w-max lg:w-[65%] gap-x-0 px-4
                       lg:mx-auto lg:justify-center"
			>
				{#each topRowBooks as book (book.name)}
					<a
						href="/ukm/{createSlug(book.name)}"
						class="flex-shrink-0 h-[30vh] lg:h-full transition-transform duration-400 ease-in-out hover:translate-y-8"
						title={book.name}
					>
						<img src={book.src} alt={book.name} class="h-full w-auto" />
					</a>
				{/each}
			</div>
		</div>

		<div
			class="absolute bottom-[4%] h-[40%] lg:h-[30%] w-full z-20
                   overflow-x-auto lg:overflow-visible scrollbar-hide"
		>
			<div
				class="flex items-end h-full w-max lg:w-[65%] gap-x-0 px-4
                       lg:mx-auto lg:justify-center"
			>
				{#each bottomRowBooks as book (book.name)}
					<a
						href="/ukm/{createSlug(book.name)}"
						class="flex-shrink-0 h-[30vh] lg:h-full transition-transform duration-400 ease-in-out hover:translate-y-8"
						title={book.name}
					>
						<img src={book.src} alt={book.name} class="h-full w-auto" />
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>