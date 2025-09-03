<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { PageFlip } from 'page-flip';

	let pageFlipContainer: HTMLElement;
	let bookWrapper: HTMLElement;

	onMount(async () => {
		if (browser) {
			try {
				const { PageFlip } = await import('page-flip');

				const rect = bookWrapper.getBoundingClientRect();
				const bookWidth = Math.floor(rect.width * 0.9);
				const bookHeight = Math.floor(rect.height * 0.9);

				const pageFlip = new PageFlip(pageFlipContainer, {
					width: Math.max(350, Math.min(420, bookWidth)),
					height: Math.max(467, Math.min(560, bookHeight)),
					showCover: false,
					size: 'stretch'
				});

				pageFlip.loadFromHTML(document.querySelectorAll('.inner-page'));

			} catch (error) {
				console.error('Failed to load or initialize PageFlip:', error);
			}
		}
	});
</script>

<div bind:this={bookWrapper} class="book-wrapper">
	<div class="book-background" />

	<div bind:this={pageFlipContainer} class="page-flip-container">
		<div class="inner-page page-blank" />
		<div class="inner-page">
			<div class="page-content">
				<h2>UKM Fotografi</h2>
				<p>This is where the description for the Photography UKM will go.</p>
				<div class="image-placeholder"><p>[Photo Gallery Images]</p></div>
			</div>
		</div>

		<div class="inner-page">
			<div class="page-content">
				<h3>Photography Activities</h3>
				<ul>
					<li>Portrait Photography Workshops</li>
					<li>Nature Photography Expeditions</li>
					<li>Digital Editing Masterclasses</li>
					<li>Annual Photo Exhibitions</li>
				</ul>
				<div class="contact-info">
					<p><strong>Contact:</strong> fotografi@ukm.edu</p>
					<p><strong>Meeting:</strong> Every Friday 4PM</p>
				</div>
			</div>
		</div>

		<div class="inner-page">
			<div class="page-content">
				<h2>UKM Musik</h2>
				<p>This is where the description for the Music UKM will go.</p>
				<div class="image-placeholder"><p>[Musical Instruments Images]</p></div>
			</div>
		</div>

		<div class="inner-page">
			<div class="page-content">
				<h3>Musical Programs</h3>
				<ul>
					<li>Band Practice Sessions</li>
					<li>Solo Performance Training</li>
					<li>Music Theory Workshops</li>
					<li>Campus Concerts</li>
				</ul>
				<div class="contact-info">
					<p><strong>Contact:</strong> musik@ukm.edu</p>
					<p><strong>Meeting:</strong> Every Wednesday 3PM</p>
				</div>
			</div>
		</div>
		<div class="inner-page page-blank" />
	</div>
</div>

<style>
	.page-blank {
		background-color: #e0d6c3 !important;
		background-image: none !important;
		box-shadow: none !important;
	}

	.book-wrapper {
		width: 100%;
		height: 100%;
		min-width: 350px;
		min-height: 467px;
		position: relative;
	}

	.book-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: url('/path/to/your/open-book-background.jpg');
		background-size: cover;
		background-position: center;
	}

	.page-flip-container {
		position: absolute;
		top: 5%;
		left: 5%;
		right: 5%;
		bottom: 5%;
		
		width: 90%;
		height: 90%;
		
		margin: 0 auto;
	}

	.inner-page {
		background-image: url('/background/yellow paper texture.jpg');
		background-size: cover;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.page-content {
		padding: 1.25rem;
		font-family: 'Georgia', serif;
		color: #4a3e36;
		height: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.page-content h2 {
		font-size: 1.3rem;
		margin-bottom: 0.8rem;
		color: #5a3e36;
		border-bottom: 2px solid #c2b5a3;
		padding-bottom: 0.4rem;
	}

	.page-content h3 {
		font-size: 1.1rem;
		margin-bottom: 0.8rem;
		color: #5a3e36;
	}

	.page-content p {
		line-height: 1.5;
		margin-bottom: 0.8rem;
		font-size: 0.9rem;
	}

	.page-content ul {
		list-style-type: none;
		padding: 0;
		margin: 0.8rem 0;
	}

	.page-content li {
		padding: 0.45rem 0;
		border-bottom: 1px dotted #c2b5a3;
		position: relative;
		padding-left: 1.2rem;
		font-size: 0.85rem;
	}

	.page-content li::before {
		content: '→';
		position: absolute;
		left: 0;
		color: #5a3e36;
		font-weight: bold;
	}

	.image-placeholder {
		background-color: #e8dcc4;
		border: 2px dashed #c2b5a3;
		padding: 1.25rem;
		text-align: center;
		margin: 0.8rem 0;
		border-radius: 6px;
		flex-grow: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
	}

	.image-placeholder p {
		color: #8a7a6a;
		font-style: italic;
		margin: 0;
		font-size: 0.85rem;
	}

	.contact-info {
		margin-top: auto;
		padding: 1rem;
		border-top: 1px solid #c2b5a3;
		background-color: rgba(197, 181, 163, 0.1);
		border-radius: 4px;
	}

	.contact-info p {
		margin: 0.25rem 0;
		font-size: 0.8rem;
	}

	@media (min-width: 768px) {
		.page-content {
			padding: 1.5rem;
		}

		.page-content h2 {
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}

		.page-content h3 {
			font-size: 1.2rem;
		}

		.page-content p {
			font-size: 0.9rem;
			margin-bottom: 1rem;
		}

		.page-content li {
			font-size: 0.85rem;
			padding: 0.5rem 0;
		}

		.image-placeholder {
			padding: 1.5rem;
			min-height: 120px;
		}

		.contact-info {
			padding: 1rem;
		}

		.contact-info p {
			font-size: 0.8rem;
		}
	}

	@media (min-width: 1024px) {
		.page-content {
			padding: 2rem;
		}

		.page-content h2 {
			font-size: 1.8rem;
		}

		.page-content h3 {
			font-size: 1.4rem;
		}

		.page-content p {
			font-size: 1rem;
		}

		.page-content li {
			font-size: 0.9rem;
		}

		.image-placeholder {
			padding: 2rem;
			min-height: 150px;
		}

		.contact-info p {
			font-size: 0.9rem;
		}
	}

	:global(.stf__outerShadow),
	:global(.stf__innerShadow),
	:global(.stf__hardShadow),
	:global(.stf__hardInnerShadow) {
		display: none !important;
	}
</style>