<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut, sineInOut } from 'svelte/easing';

	const faqs = [
		{
			id: 1,
			question: 'Apa saja kegiatan Open House 2025?',
			answer:
				'Open House 2025 merupakan acara yang mewadahi seluruh UKM, LK, dan KBM di Petra Christian University untuk memperkenalkan program dan kegiatan kepada mahasiswa baru. Melalui pembukaan booth, penampilan karya, dan pertunjukan dari masing-masing UKM/LK/KBM, acara ini bertujuan mengundang mahasiswa untuk mengenal, memilih, serta bergabung sesuai dengan minat dan bakat mereka.'
		},
		{
			id: 2,
			question: 'Kapan & Dimana kegiatan Open House 2025 berlangsung?',
			answer:
				'Open House 2025 akan dilaksanakan selama 4 hari, di tanggal 16-19 Sept 2025. Selasa - Kamis, 16-18 September 2025 di Gedung W, P, Q. Jumat, 19 September 2025 di Gedung Q.'
		},
		{
			id: 3,
			question: 'Apakah Mahasiswa Baru 2025 wajib mendaftar UKM?',
			answer:
				'Mahasiswa Baru tidak wajib mengikuti UKM, tetapi disarankan untuk mendaftar karena UKM merupakan tempat bagi Mahasiswa Baru untuk mengembangkan bakat dan minat.'
		},
		{
			id: 4,
			question: 'Apakah Mahasiswa Baru 2025 diperbolehkan mendaftar lebih dari 1 UKM?',
			answer:
				'Mahasiswa Baru 2025 diperbolehkan mendaftar lebih dari 1 UKM dengan syarat jadwal pelaksanaan UKM tidak saling bertabrakan.'
		},
		{
			id: 5,
			question: 'Apakah pendaftaran UKM oleh Mahasiswa Baru 2025 pasti akan menerima?',
			answer:
				'Pendaftaran mahasiswa baru ke UKM pada Open House 2025 tidak selalu berarti langsung diterima sebagai anggota. Bagi UKM yang menerapkan proses seleksi, mahasiswa baru wajib mengikuti tahapan seleksi terlebih dahulu sebelum resmi menjadi anggota. Namun, apabila mendaftar pada UKM yang tidak memiliki prosedur seleksi, maka mahasiswa baru akan langsung diterima sebagai anggota.'
		},
		{
			id: 6,
			question: 'Apakah Mahasiswa Baru 2025 bisa mendaftar menjadi anggota LK-KBM?',
			answer:
				'Mahasiswa Baru 2025 belum bisa mendaftar LK-KBM dikarenakan PCU menerapkan program Pola Pengembangan Mahasiswa (POLBANGMAWA) yang bertujuan untuk mempersiapkan Mahasiswa Baru untuk mempersiapkan diri untuk menjadi Fungsionaris LK dengan mengikuti Servant Leadership Training (SLT) sebagai persyaratan sebelum Mahasiswa Baru bergabung ke dalam LK.'
		},
		{
			id: 7,
			question: 'Bagaimana prosedur pendaftaran UKM?',
			answer:
				'Pendaftaran UKM hanya dapat dilakukan melalui website resmi Open House 2025. Pembayaran juga dilakukan dengan satu jalur, langsung melalui rekening Petra. Apabila membayar diluar ini, maka bukan tanggung jawab dari pihak panitia. Notes : terdapat kode unik pembayaran untuk UKM. Mahasiswa diharapkan untuk mengikuti kode sesuai dengan UKM yang dipilih.'
		},
		{
			id: 8,
			question: 'Apakah boleh membayar uang pendaftaran bersama dengan teman?',
			answer:
				'Mahasiswa Baru tidak diperbolehkan untuk melakukan penggabungan pembayaran bersama dengan teman untuk menjaga transparansi pembayaran.'
		},
		{
			id: 9,
			question: 'Apakah boleh membatalkan registrasi setelah melakukan pembayaran?',
			answer:
				'Pembatalan registrasi setelah melakukan pembayaran uang pendaftaran tidak disarankan, karena mahasiswa baru yang telah membayar dianggap telah menyelesaikan proses keanggotaan. Oleh sebab itu, mahasiswa baru diharapkan memastikan kembali pilihan UKM yang hendak diikuti sebelum melakukan pembayaran.'
		},
		{
			id: 10,
			question: 'Kapan pendaftaran UKM akan ditutup?',
			answer: 'Pendaftaran UKM akan ditutup pada hari Jumat, 20 September 2025.'
		}
	];

	// --- State for Pagination and Selection ---
	let selectedQuestion: number | null = null;
	let currentPage = 0;
	const questionsPerPage = 2;
	const totalPages = Math.ceil(faqs.length / questionsPerPage);

	$: visibleFaqs = faqs.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

	function selectQuestion(index: number) {
		selectedQuestion = selectedQuestion === index ? null : index;
	}

	function nextPage() {
		if (currentPage < totalPages - 1) {
			currentPage++;
		}
	}

	function prevPage() {
		if (currentPage > 0) {
			currentPage--;
		}
	}
</script>

<section class="relative h-full w-full overflow-hidden bg-transparent">
	<img
		src="/svg/home/mascot stage v3.svg"
		alt="Event Mascot on Stage"
		class="absolute bottom-[35%] md:bottom-[20%] left-1/2 z-30 w-[220%] md:w-[100%] max-w-none -translate-x-1/2"
	/>

	{#if selectedQuestion !== null}
		{#key selectedQuestion}
			<div
				class="answer-bubble absolute z-40 w-[90%] max-w-lg rounded-2xl p-6 shadow-2xl backdrop-blur-sm
                       top-[5%] left-1/2 -translate-x-1/2
                       md:top-[15%] md:left-auto md:right-[5%] md:translate-x-0 bg-gradient-to-tr from-[#F6BABC] to-[#FFF1E5]"
				transition:fly={{ y: -20, duration: 400, easing: quintOut }}
			>
				<!-- <h3 class="mb-2 text-2xl font-bold text-[var(--text-dark)] font-lexend flex items-center gap-4">
					Question
					<span class="font-spicyrice text-5xl text-[var(--color-burgundy)]"
						>{String(faqs[selectedQuestion].id).padStart(2, '0')}</span
					>
				</h3> -->
				<p class="text-base text-[var(--text-dark)] font-lexend">
					{faqs[selectedQuestion].answer}
				</p>
			</div>
		{/key}
	{/if}

	<div class="absolute bottom-0 left-0 right-0 top-[55%] bg-[#2a121a] z-0" />

	<div
		class="absolute bottom-0 left-0 right-0 top-[650] md:top-[75%] z-20 flex flex-col items-center justify-center gap-6 px-6 pt-4 pb-12 md:pb-0 text-white"
	>
		<div class="w-full max-w-6xl flex items-center justify-center gap-4 md:gap-8">
			<button
				on:click={prevPage}
				disabled={currentPage === 0}
				class="pagination-btn hidden md:block"
			>
				&larr;
			</button>

			<div class="flex-grow w-full rounded-sm bg-gradient-[">
				<div class="hidden md:block min-h-[150px] relative">
					{#key currentPage}
						<div
							class="absolute inset-0 flex items-center justify-center"
							in:fly={{ x: 200, duration: 500, easing: sineInOut, delay: 50 }}
							out:fly={{ x: -200, duration: 500, easing: sineInOut }}
						>
							<div class="grid w-full grid-cols-2 gap-8">
								{#each visibleFaqs as faq (faq.id)}
									<button
										on:click={() => selectQuestion(faq.id - 1)}
										class="flex items-start gap-4 p-4 text-left transition-opacity duration-200 hover:opacity-100"
										class:active={selectedQuestion === faq.id - 1}
										class:inactive={selectedQuestion !== null && selectedQuestion !== faq.id - 1}
									>
										<span
											class="font-spicyrice text-7xl font-light bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)] bg-clip-text text-transparent"
											>{String(faq.id).padStart(2, '0')}</span
										>
										<p class="my-1 text-white/90 font-lexend">{faq.question}</p>
									</button>
								{/each}
							</div>
						</div>
					{/key}
				</div>
				<div class="block h-[25vh] space-y-4 overflow-y-auto md:hidden">
					{#each faqs as faq (faq.id)}
						<button
							on:click={() => selectQuestion(faq.id - 1)}
							class="flex w-full items-start gap-4 p-4 text-left"
							class:active={selectedQuestion === faq.id - 1}
						>
							<span
								class="font-spicyrice text-6xl font-light bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)] bg-clip-text text-transparent"
								>{String(faq.id).padStart(2, '0')}</span
							>
							<p class="mt-1 text-white/90 font-lexend">{faq.question}</p>
						</button>
					{/each}
				</div>
			</div>

			<button
				on:click={nextPage}
				disabled={currentPage === totalPages - 1}
				class="pagination-btn hidden md:block"
			>
				&rarr;
			</button>
		</div>
	</div>
</section>

<style>

	.answer-bubble::after {
		content: '';
		position: absolute;
		bottom: 0;
		width: 24px;
		height: 24px;
		background: var(--color-soft-pink);
		transform: translateY(50%) rotate(45deg);
		border-radius: 4px;
		z-index: -1;
	}
	/* Mobile bubble tail (center) */
	.answer-bubble::after {
		left: 50%;
		transform: translateY(50%) translateX(-50%) rotate(45deg);
	}
	/* Desktop bubble tail (left side, pointing to mascot) */
	@media (min-width: 768px) {
		.answer-bubble::after {
			left: 20%;
			transform: translateY(50%) translateX(-50%) rotate(45deg);
		}
	}

	button {
		background-color: transparent;
		border: none;
	}
	button.inactive {
		opacity: 0.3;
	}
	button.active {
		opacity: 1;
	}

	.pagination-btn {
		flex-shrink: 0;
		width: 50px;
		height: 50px;
		border-radius: 9999px;
		font-size: 1.5rem;
		background-color: rgba(255, 255, 255, 0.1);
		transition: all 0.2s;
	}
	.pagination-btn:hover:not(:disabled) {
		background-color: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}
	.pagination-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
</style>