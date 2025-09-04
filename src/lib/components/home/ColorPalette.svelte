<section
	id="style-guide-preview"
	class="w-full py-16 px-4 sm:px-8 bg-gradient-to-tl from-[var(--bg-dark-primary)] via-[var(--bg-dark-secondary)] to-[var(--bg-dark-tertiary)] text-[var(--text-primary)]"
>
	<div class="max-w-6xl mx-auto flex flex-col gap-12">
		<div class="text-center">
			<h2 class="font-moomello text-5xl md:text-7xl mb-2">Color Palette</h2>
			<p class="text-[var(--text-tertiary)]">Gradient use case example.</p>
		</div>

		<div>
			<h3 class="font-lexend text-3xl font-bold mb-6 border-b-2 border-[var(--color-dark-red-3)] pb-2">
				Text Styles
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
				<div class="flex flex-col gap-4">
					<div>
						<p class="text-sm text-[var(--text-tertiary)] mb-1">Primary Text (--text-primary)</p>
						<p class="text-lg text-[var(--text-primary)]">
							The quick brown fox jumps over the lazy dog.
						</p>
					</div>
					<div>
						<p class="text-sm text-[var(--text-tertiary)] mb-1">
							Secondary Text (--text-secondary)
						</p>
						<p class="text-lg text-[var(--text-secondary)]">
							Used for subtitles and less important information.
						</p>
					</div>
					<div>
						<p class="text-sm text-[var(--text-tertiary)] mb-1">Gradient Text</p>
						<h2
							class="font-moomello text-8xl tracking-tight bg-gradient-to-tr from-[var(--text-secondary)] via-[var(--text-primary)] to-[var(--color-white)] bg-clip-text text-transparent"
						>
							OPENHOUSE
						</h2>
					</div>
				</div>

				<div class="bg-[var(--color-cream)] p-6 rounded-lg flex flex-col gap-4">
					<div>
						<p class="text-sm text-[var(--color-burgundy)] mb-1">
							Dark Text (--text-dark) on a light background
						</p>
						<p class="text-lg text-[var(--text-dark)]">
							The quick brown fox jumps over the lazy dog.
						</p>
					</div>
					<div>
						<p class="text-sm text-[var(--color-burgundy)] mb-1">
							Dark Secondary Text (--text-dark-secondary)
						</p>
						<p class="text-lg text-[var(--text-dark-secondary)]">
							Used for subtitles on light backgrounds.
						</p>
					</div>
				</div>
			</div>
		</div>

		<div>
			<h3 class="font-lexend text-3xl font-bold mb-6 border-b-2 border-[var(--color-dark-red-3)] pb-2">
				Background Styles
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div
					class="h-48 rounded-lg bg-gradient-to-tl from-[var(--bg-dark-primary)] via-[var(--bg-dark-secondary)] to-[var(--bg-dark-tertiary)] flex items-center justify-center p-4"
				>
					<p class="font-bold text-center">Dark Background</p>
				</div>
				<div
					class="h-48 rounded-lg bg-gradient-to-t from-[var(--bg-light-primary)] to-[var(--bg-light-secondary)] flex items-center justify-center p-4"
				>
					<p class="font-bold text-center text-[var(--text-dark)]">Light Background</p>
				</div>
			</div>
		</div>
        <div>
            <h3 class="font-lexend text-3xl font-bold mb-6 border-b-2 border-[var(--color-dark-red-3)] pb-2">
                Button Styles
            </h3>
            
            <div class="flex flex-col items-center gap-8 p-8 bg-[var(--color-deep-purple)] rounded-lg">
                
                <div class="flex flex-wrap items-center justify-center gap-6">
                    <button
                        class="px-6 py-3 font-bold text-[var(--text-dark)] rounded-lg text-lg transition-transform hover:scale-105 bg-gradient-to-t from-[var(--bg-light-primary)] to-[var(--bg-light-secondary)]"
                    >
                        Primary Button
                    </button>

                    <button
                        class="px-6 py-3 font-bold text-[var(--text-primary)] rounded-lg text-lg transition-transform hover:scale-105 bg-[radial-gradient(ellipse_at_bottom,_var(--button-blue-primary)_0%,_var(--button-blue-secondary)_40%,_var(--button-blue-tertiary)_100%)]"
                    >
                        Secondary Button
                    </button>

                    <button
                        class="px-6 py-3 font-bold text-[var(--text-primary)] rounded-lg text-lg transition-transform hover:scale-105 bg-gradient-to-r from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)]"
                    >
                        Tertiary Button
                    </button>
                </div>

                <p class="text-sm text-[var(--text-tertiary)] tracking-widest">-- WITH OUTLINES --</p>
                
                <div class="flex flex-wrap items-center justify-center gap-6">
                    <button
                        class="p-0.5 rounded-lg bg-gradient-to-t from-[var(--button-outline-primary)] to-[var(--button-outline-secondary)] transition-transform hover:scale-105"
                    >
                        <span
                            class="block rounded-md px-5 py-2 font-bold text-lg text-[var(--text-dark)] bg-gradient-to-t from-[var(--bg-light-primary)] to-[var(--bg-light-secondary)]"
                        >
                            Primary Button
                        </span>
                    </button>
                    
                    <button
                        class="p-0.5 rounded-lg bg-gradient-to-t from-[var(--button-outline-primary)] to-[var(--button-outline-secondary)] transition-transform hover:scale-105"
                    >
                        <span
                            class="block rounded-md px-5 py-2 font-bold text-lg text-[var(--text-primary)] bg-[radial-gradient(ellipse_at_bottom,_var(--button-blue-primary)_0%,_var(--button-blue-secondary)_40%,_var(--button-blue-tertiary)_100%)]"
                        >
                            Secondary Button
                        </span>
                    </button>

                    <button
                        class="p-0.5 rounded-lg bg-gradient-to-t from-[var(--button-outline-primary)] to-[var(--button-outline-secondary)] transition-transform hover:scale-105"
                    >
                        <span
                            class="block rounded-md px-5 py-2 font-bold text-lg text-[var(--text-primary)] bg-gradient-to-r from-[var(--button-violet-primary)] via-[var(--button-violet-secondary)] to-[var(--button-violet-primary)]"
                        >
                            Tertiary Button
                        </span>
                    </button>
                </div>

            </div>
        </div>
	</div>
</section>