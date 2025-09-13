<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut, sineInOut } from 'svelte/easing';
	import { onMount, onDestroy } from 'svelte';

	const faqs = [
		{
			id: 1,
			question: 'Apa saja kegiatan Open House 2025?',
			answer:
				'(Open House 2025) merupakan acara yang mewadahi (seluruh UKM, LK-KBM) di Petra Christian University untuk memperkenalkan program dan kegiatan kepada mahasiswa baru. Melalui (pembukaan booth), (penampilan karya), dan (pertunjukan) dari masing-masing (UKM/LK-KBM), acara ini bertujuan mengundang mahasiswa untuk (mengenal), (memilih), serta (bergabung) sesuai dengan (minat dan bakat) mereka.'
		},
		{
			id: 2,
			question: 'Kapan & Dimana kegiatan Open House 2025 berlangsung?',
			answer:
				'(Open House 2025) akan dilaksanakan selama (4 hari), di tanggal (16-18 Sept 2025). (Selasa - Kamis), (16-18 September 2025) di (Gedung W, P, Q). (Jumat), (19 September 2025) di (Gedung Q).'
		},
		{
			id: 3,
			question: 'Apakah Mahasiswa Baru 2025 wajib mendaftar UKM?',
			answer:
				'Mahasiswa Baru tidak wajib mengikuti UKM, tetapi (disarankan untuk mendaftar) karena UKM merupakan tempat bagi Mahasiswa Baru untuk (mengembangkan bakat dan minat).'
		},
		{
			id: 4,
			question: 'Apakah Mahasiswa Baru 2025 diperbolehkan mendaftar lebih dari 1 UKM?',
			answer:
				'Mahasiswa Baru 2025 (diperbolehkan) mendaftar (lebih dari 1 UKM) dengan syarat jadwal pelaksanaan UKM (tidak saling bertabrakan).'
		},
		{
			id: 5,
			question: 'Apakah pendaftaran UKM oleh Mahasiswa Baru 2025 pasti akan menerima?',
			answer:
				'Pendaftaran mahasiswa baru ke (UKM) pada Open House 2025 (tidak selalu) berarti (langsung diterima) sebagai anggota. Bagi (UKM) yang menerapkan (proses seleksi), mahasiswa baru (wajib) mengikuti (tahapan seleksi) terlebih dahulu sebelum resmi menjadi anggota. Namun, apabila mendaftar pada (UKM) yang (tidak) memiliki prosedur seleksi, maka mahasiswa baru akan (langsung diterima) sebagai anggota.'
		},
		{
			id: 6,
			question: 'Apakah Mahasiswa Baru 2025 bisa mendaftar menjadi anggota LK-KBM?',
			answer:
				'Mahasiswa Baru 2025 (belum bisa) mendaftar (LK-KBM) dikarenakan PCU menerapkan program (Pola Pengembangan Mahasiswa) (POLBANGMAWA). (POLBANGMAWA) bertujuan untuk mempersiapkan Mahasiswa Baru untuk mempersiapkan diri untuk menjadi (Fungsionaris LK) dengan mengikuti (Servant Leadership Training) (SLT) sebagai persyaratan sebelum Mahasiswa Baru bergabung ke dalam LK.'
		},
		{
			id: 7,
			question: 'Bagaimana prosedur pendaftaran UKM?',
			answer:
				'Pendaftaran UKM hanya dapat dilakukan melalui (website resmi Open House 2025). Pembayaran juga dilakukan dengan satu jalur, langsung melalui (rekening Petra). Apabila membayar di luar ini, maka bukan tanggung jawab dari pihak panitia. Notes : terdapat (kode unik pembayaran) untuk (UKM). Mahasiswa diharapkan untuk mengikuti kode (sesuai) dengan (UKM yang dipilih).'
		},
		{
			id: 8,
			question: 'Apakah boleh membayar uang pendaftaran bersama dengan teman?',
			answer:
				'Mahasiswa Baru (tidak diperbolehkan) untuk melakukan penggabungan pembayaran bersama dengan teman untuk menjaga transparansi pembayaran.'
		},
		{
			id: 9,
			question: 'Apakah boleh membatalkan registrasi setelah melakukan pembayaran?',
			answer:
				'Pembatalan registrasi setelah melakukan pembayaran uang pendaftaran (tidak disarankan), karena mahasiswa baru yang telah membayar dianggap telah menyelesaikan (proses keanggotaan). Oleh sebab itu, mahasiswa baru diharapkan (memastikan kembali pilihan UKM) yang hendak diikuti sebelum melakukan pembayaran.'
		},
		{
			id: 10,
			question: 'Kapan pendaftaran UKM akan ditutup?',
			answer: 'Pendaftaran UKM akan ditutup pada hari (Jumat, 19 September 2025).'
		}
	];

	let selectedQuestion: number | null = null;
	let currentPage = 0;
	const questionsPerPage = 2;
	const totalPages = Math.ceil(faqs.length / questionsPerPage);
	let animationDirection = 1;

	let displayedText = '';
	let currentSentenceIndex = 0;
	let typewriterInterval: number | null = null;
	let isTyping = false;
	let sentences: string[] = [];
	let processedSentences: string[] = [];
	let hasMoreSentences = false;
	let hasPreviousSentences = false;
	let isCompleted = false;
	let hasManuallyNavigated = false;

	let faqSection: HTMLElement;
	let observer: IntersectionObserver;

	let scrollableContainer: HTMLElement;
	let scrollInterval: number | null = null;
	let canScrollDown = true;
	let canScrollUp = false;

	$: visibleFaqs = faqs.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

	function processHighlights(text: string): string {
		let processedText = text;
		processedText = processedText.replace(/\(\(([^)]+)\)\)/g, '<span class="keyword-highlight">$1</span>');
		processedText = processedText.replace(/\(([^)]+)\)/g, '<span class="keyword-highlight">$1</span>');
		return processedText;
	}

	function splitIntoSentences(text: string): string[] {
		return text
			.split(/(?<=[.!?])\s+/)
			.filter((sentence) => sentence.trim().length > 0)
			.map((sentence) => sentence.trim());
	}

	function startTypewriter(text: string) {
		clearTypewriter();
		sentences = splitIntoSentences(text);
		processedSentences = sentences.map((sentence) => processHighlights(sentence));
		currentSentenceIndex = 0;
		updateSentenceState();
		typeCurrentSentence();
	}

	function updateSentenceState() {
		hasMoreSentences = currentSentenceIndex < sentences.length - 1;
		hasPreviousSentences = currentSentenceIndex > 0;
		isCompleted = !isTyping && currentSentenceIndex === sentences.length - 1;
	}

	function typeCurrentSentence() {
		if (currentSentenceIndex >= processedSentences.length) return;
		const currentSentence = processedSentences[currentSentenceIndex];
		displayedText = '';
		isTyping = true;
		updateSentenceState();
		let charIndex = 0;
		const plainText = currentSentence.replace(/<[^>]*>/g, '');
		typewriterInterval = setInterval(() => {
			let tempText = '';
			let plainCharCount = 0;
			let i = 0;
			while (i < currentSentence.length && plainCharCount <= charIndex) {
				if (currentSentence[i] === '<') {
					let tagEnd = currentSentence.indexOf('>', i);
					if (tagEnd !== -1) {
						tempText += currentSentence.substring(i, tagEnd + 1);
						i = tagEnd + 1;
					} else {
						tempText += currentSentence[i++];
					}
				} else {
					tempText += currentSentence[i++];
					plainCharCount++;
				}
			}
			displayedText = tempText;
			if (charIndex < plainText.length) {
				charIndex++;
			} else {
				isTyping = false;
				updateSentenceState();
				if (typewriterInterval) {
					clearInterval(typewriterInterval);
					typewriterInterval = null;
				}
				if (hasMoreSentences) {
					setTimeout(() => {
						if (selectedQuestion !== null) nextSentence();
					}, 1500);
				}
			}
		}, 30);
	}

	function nextSentence() {
		if (currentSentenceIndex < sentences.length - 1) {
			hasManuallyNavigated = false;
			currentSentenceIndex++;
			typeCurrentSentence();
		}
	}

    function manualNextSentence() {
	if (currentSentenceIndex < sentences.length - 1) {
		hasManuallyNavigated = true;
		currentSentenceIndex++;
		displayedText = processedSentences[currentSentenceIndex];
		isTyping = false;
		updateSentenceState();
	}
}

	function previousSentence() {
		if (currentSentenceIndex > 0) {
			hasManuallyNavigated = true;
			currentSentenceIndex--;
			displayedText = processedSentences[currentSentenceIndex];
			isTyping = false;
			updateSentenceState();
		}
	}

	function skipCurrentTyping() {
		if (isTyping && typewriterInterval) {
			clearInterval(typewriterInterval);
			typewriterInterval = null;
			displayedText = processedSentences[currentSentenceIndex];
			isTyping = false;
			updateSentenceState();
			if (hasMoreSentences) {
				setTimeout(() => {
					if (selectedQuestion !== null) nextSentence();
				}, 500);
			}
		}
	}

	function clearTypewriter() {
		if (typewriterInterval) {
			clearInterval(typewriterInterval);
			typewriterInterval = null;
		}
		isTyping = false;
		displayedText = '';
		currentSentenceIndex = 0;
		sentences = [];
		processedSentences = [];
		hasMoreSentences = false;
		hasPreviousSentences = false;
		isCompleted = false;
		hasManuallyNavigated = false;
	}

	function selectQuestion(index: number) {
		if (selectedQuestion === index) {
			selectedQuestion = null;
			clearTypewriter();
		} else {
			selectedQuestion = index;
			startTypewriter(faqs[index].answer);
		}
	}

	function nextPage() {
		if (currentPage < totalPages - 1) {
			selectedQuestion = null;
			clearTypewriter();
			animationDirection = 1;
			currentPage++;
		}
	}

	function prevPage() {
		if (currentPage > 0) {
			selectedQuestion = null;
			clearTypewriter();
			animationDirection = -1;
			currentPage--;
		}
	}

function startScroll(direction: 'up' | 'down') {
	if (scrollInterval) clearInterval(scrollInterval);

	const amount = direction === 'down' ? 10 : -10; 

	scrollInterval = setInterval(() => {
		if (!scrollableContainer) {
			stopScroll();
			return;
		}

		const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;
		const isAtTop = scrollTop === 0;
		const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

		if ((direction === 'up' && isAtTop) || (direction === 'down' && isAtBottom)) {
			stopScroll();
			return;
		}

		scrollableContainer.scrollBy({ top: amount, behavior: 'auto' });
	}, 16);
}

function stopScroll() {
	if (scrollInterval) {
		clearInterval(scrollInterval);
		scrollInterval = null;
	}
}

	function handleScroll() {
		if (!scrollableContainer) return;
		const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;
		canScrollUp = scrollTop > 0;
		canScrollDown = scrollHeight - scrollTop > clientHeight + 1;
	}

	onMount(() => {
		const options = {
			root: null,
			threshold: 0.1
		};

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting && selectedQuestion !== null) {
					selectedQuestion = null;
					clearTypewriter();
				}
			});
		}, options);

		if (faqSection) {
			observer.observe(faqSection);
		}
	});

	onDestroy(() => {
		clearTypewriter();
		stopScroll();
		if (observer) {
			observer.disconnect();
		}
	});
</script>

<section bind:this={faqSection} class="relative h-full w-full overflow-hidden bg-transparent">
    <img
        src="/faq/mascot-front.webp"
        alt="Event Mascot on Stage"
        class="absolute bottom-[42%] xl:bottom-[35%] left-1/2 z-40 w-[54%] sm:w-[44%] md:w-[34%] xl:w-[24%] max-w-none -translate-x-1/2"
    />
    <img
        src="/faq/stage-plank.webp"
        alt="Event Mascot on Stage"
        class="absolute bottom-[35%] md:bottom-[32%] xl:bottom-[20%] left-1/2 z-10 w-[220%] md:w-[160%] xl:w-[100%] max-w-none -translate-x-1/2"
    />

    {#if selectedQuestion === null}
        <div
            class="absolute z-20 text-center
                   top-[5%] left-1/2 -translate-x-1/2
                   xl:top-[15%] xl:left-[16%] xl:translate-x-0 xl:text-left"
            transition:fly={{ y: -20, duration: 400, easing: quintOut }}
        >
            <h2
                class="font-moomello text-[10rem] xl:text-[14rem] 2xl:text-[18rem] racking-tight bg-gradient-to-tr from-[var(--text-secondary)] via-[var(--text-primary)] to-[var(--color-white)] bg-clip-text text-transparent z-[-1] xl:z-[0]"
            >
                FAQ
            </h2>
        </div>
    {/if}

    {#if selectedQuestion !== null}
        {#key selectedQuestion}
            <div
                class="answer-bubble absolute z-40 w-[90%] max-w-lg rounded-2xl p-4 shadow-2xl backdrop-blur-sm
                           flex flex-col
                           top-[5%] left-1/2 -translate-x-1/2
                           xl:top-[15%] xl:left-auto xl:right-[5%] xl:translate-x-0 bg-gradient-to-tr from-[#F6BABC] to-[#FFF1E5]"
                transition:fly={{ y: -20, duration: 400, easing: quintOut }}
            >
                <p class="text-base text-[var(--text-dark)] font-lexend leading-relaxed">
                    {@html displayedText}
                    {#if isTyping}
                        <span class="typewriter-cursor">|</span>
                    {/if}
                </p>

                <div class="bottom-right-controls">
                    {#if isTyping}
                        <button
                            class="control-button skip-button"
                            on:click={skipCurrentTyping}
                            title="Skip animation"
                            aria-label="Skip typing animation"
                        >
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                            >
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    {:else if hasMoreSentences && !isCompleted && !hasManuallyNavigated}
                        <div class="next-indicator">
                            <div class="next-dot"></div>
                            <div class="next-dot"></div>
                            <div class="next-dot"></div>
                        </div>
                    {:else if (isCompleted || hasManuallyNavigated) && sentences.length > 1}
                        <div class="navigation-controls">
                            <button
                                class="control-button nav-button"
                                class:disabled={!hasPreviousSentences}
                                on:click={previousSentence}
                                disabled={!hasPreviousSentences}
                                title="Previous sentence"
                                aria-label="Go to previous sentence"
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                >
                                    <path d="m15 18-6-6 6-6" />
                                </svg>
                            </button>

                            <div class="sentence-counter">
                                {currentSentenceIndex + 1}/{sentences.length}
                            </div>

                            <button
                                class="control-button nav-button"
                                class:disabled={!hasMoreSentences}
                                on:click={manualNextSentence}
                                disabled={!hasMoreSentences}
                                title="Next sentence"
                                aria-label="Go to next sentence"
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                >
                                    <path d="m9 18 6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        {/key}
    {/if}

    <div class="absolute bottom-0 left-0 right-0 top-[55%] xl:top-[75%] bg-[#25081B] z-0"></div>

    <div
        class="absolute bottom-0 left-0 right-0 top-[65%] md:top-[68%] xl:top-[75%] z-20 flex flex-col items-center justify-start gap-6 px-6 xl:pt-6 pb-12 xl:pb-0 text-white"
    >
        <div class="w-full max-w-6xl flex items-center justify-center gap-4 xl:gap-8">
            <button
                on:click={prevPage}
                disabled={currentPage === 0}
                class="pagination-btn hidden xl:block"
                class:disabled={currentPage === 0}
                aria-label="Previous page of questions"
            >
                <div
                    class="p-0.5 rounded-full bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)] transition-transform hover:scale-105"
                >
                    <span
                        class="block rounded-full px-3 py-2 bg-gradient-to-r from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)]"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            class="arrow-icon"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </span>
                </div>
            </button>

            <div class="flex-grow w-full rounded-sm relative">
                <div class="hidden xl:block min-h-[150px] relative overflow-hidden">
                    {#key currentPage}
                        <div
                            class="absolute inset-0 flex items-center justify-center"
                            in:fly={{
                                x: animationDirection * 200,
                                duration: 500,
                                easing: sineInOut,
                                delay: 50
                            }}
                            out:fly={{
                                x: animationDirection * -200,
                                duration: 500,
                                easing: sineInOut
                            }}
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

                <div
                    class="xl:hidden px-[2px] pb-[2px] rounded-b-lg bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)]"
                >
                    <div
                        bind:this={scrollableContainer}
                        on:scroll={handleScroll}
                        class="block h-[25vh] space-y-4 overflow-y-auto py-4 bg-[#1a030b] rounded-b-lg"
                    >
                        {#each faqs as faq (faq.id)}
                            <button
                                on:click={() => selectQuestion(faq.id - 1)}
                                class="flex w-full items-start gap-4 p-4 text-left transition-opacity duration-200"
                                class:active={selectedQuestion === faq.id - 1}
                                class:inactive={selectedQuestion !== null && selectedQuestion !== faq.id - 1}
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

                <div
                    class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10 flex gap-2 xl:hidden"
                >
                <button
                    on:mousedown={() => startScroll('up')}
                    on:mouseup={stopScroll}
                    on:touchstart|preventDefault={() => startScroll('up')}
                  	 on:touchend={stopScroll}
                    disabled={!canScrollUp}
                  	 title="Scroll up"
                  	 aria-label="Scroll questions up"
                  	 class="pagination-btn"
                  	 class:disabled={!canScrollUp}
              	 >
                        <div
                            class="p-0.5 rounded-full bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)]"
                        >
                            <span
                                class="block rounded-full px-3 py-2 bg-gradient-to-r from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)]"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    fill="none"
                                  	 class="arrow-icon"
                                >
                                  	 <path d="m18 15-6-6-6 6" />
                                </svg>
                            </span>
                        </div>
                  	 </button>
                	 <button
                    	 on:mousedown={() => startScroll('down')}
                    	 on:mouseup={stopScroll}
                    	 on:touchstart|preventDefault={() => startScroll('down')}
                    	 on:touchend={stopScroll}
                    	 disabled={!canScrollDown}
                    	 title="Scroll down"
                    	 aria-label="Scroll questions down"
                    	 class="pagination-btn"
                    	 class:disabled={!canScrollDown}
                	 >
                      	 <div
                          	 class="p-0.5 rounded-full bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)]"
                      	 >
                          	 <span
                              	 class="block rounded-full px-3 py-2 bg-gradient-to-r from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)]"
                          	 >
                              	 <svg
                                  	 width="24"
                                  	 height="24"
                                  	 viewBox="0 0 24 24"
                                  	 stroke="currentColor"
                                  	 stroke-width="2.5"
                                  	 fill="none"
                                  	 class="arrow-icon"
                              	 >
                                  	 <path d="m6 9 6 6 6-6" />
                              	 </svg>
                          	 </span>
                      	 </div>
                  	 </button>
              	 </div>
            </div>

          	 <button
            	 on:click={nextPage}
            	 disabled={currentPage === totalPages - 1}
            	 class="pagination-btn hidden xl:block"
            	 class:disabled={currentPage === totalPages - 1}
            	 aria-label="Next page of questions"
          	 >
            	 <div
              	 class="p-0.5 rounded-full bg-gradient-to-t from-[var(--color-light-gold)] to-[var(--color-off-white)] transition-transform hover:scale-105"
            	 >
              	 <span
                	 class="block rounded-full px-3 py-2 bg-gradient-to-r from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)]"
              	 >
                	 <svg
                  	 width="16"
                  	 height="16"
                  	 viewBox="0 0 24 24"
                  	 fill="none"
                  	 stroke="currentColor"
                  	 stroke-width="2.5"
                  	 class="arrow-icon"
                	 >
                  	 <path d="m9 18 6-6-6-6" />
                	 </svg>
              	 </span>
            	 </div>
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
		background: linear-gradient(135deg, #f6babc, #fff1e5);
		transform: translateY(50%) rotate(45deg);
		border-radius: 4px;
		z-index: -1;
	}

	.answer-bubble::after {
		left: 50%;
		transform: translateY(50%) translateX(-50%) rotate(45deg);
	}

	@media (min-width: 1280px) {
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
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.pagination-btn:hover:not(.disabled) {
		transform: scale(1.05);
	}

	.pagination-btn.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.pagination-btn.disabled:hover {
		transform: none;
	}

	.arrow-icon {
		stroke: var(--color-light-gold);
		transition: stroke 0.2s ease;
	}

	.pagination-btn:hover:not(.disabled) .arrow-icon {
		stroke: var(--color-off-white);
	}

	.typewriter-cursor {
		animation: blink 1s infinite;
		font-weight: bold;
		color: #2a121a;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}

	:global(.keyword-highlight) {
		color: #8e183c;
		font-weight: 600;
	}

	.bottom-right-controls {
		display: flex;
		align-items: center;
		gap: 8px;
		align-self: flex-end;
		margin-top: 2px;
	}

	.control-button {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
		transition: all 0.2s ease;
		cursor: pointer;
		color: #2a121a;
		backdrop-filter: blur(4px);
		border: 1px solid rgba(142, 24, 60, 0.2);
	}

	.control-button:hover:not(.disabled) {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.control-button.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.skip-button {
		background: rgba(142, 24, 60, 0.1);
		border-color: rgba(142, 24, 60, 0.3);
		color: #8e183c;
	}

	.skip-button:hover {
		background: rgba(142, 24, 60, 0.2);
		border-color: rgba(142, 24, 60, 0.5);
	}

	.control-text {
		font-size: 0.7rem;
		font-weight: 600;
	}

	.navigation-controls {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px;
		border-radius: 18px;
		backdrop-filter: blur(6px);
		border: 1px solid rgba(142, 24, 60, 0.2);
	}

	.nav-button {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(142, 24, 60, 0.1);
	}

	.nav-button:hover:not(.disabled) {
		border-color: rgba(142, 24, 60, 0.3);
		transform: scale(1.1);
	}

	.sentence-counter {
		font-size: 0.7rem;
		font-weight: 600;
		color: #2a121a;
		min-width: 32px;
		text-align: center;
		padding: 0 4px;
	}

	.next-indicator {
		display: flex;
		gap: 3px;
		padding: 8px;
	}

	.next-dot {
		width: 6px;
		height: 6px;
		background-color: rgba(142, 24, 60, 0.6);
		border-radius: 50%;
		animation: pulse-next 1.5s infinite;
	}

	.next-dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.next-dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes pulse-next {
		0%,
		80%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		40% {
			opacity: 1;
			transform: scale(1.3);
		}
	}
    
</style>