<script lang="ts">
	let { size = 56, label = 'Loading' }: { size?: number; label?: string } = $props();
</script>

<svg
	role="status"
	aria-label={label}
	viewBox="0 0 48 48"
	width={size}
	height={size}
	class="shrink-0"
>
	<circle cx="24" cy="24" r="22" class="fill-none stroke-hairline" stroke-width="1.5" />
	<circle
		cx="24"
		cy="24"
		r="22"
		pathLength="100"
		stroke-dasharray="26 74"
		stroke-linecap="round"
		stroke-width="1.5"
		class="brand-spinner-arc fill-none stroke-go"
	/>
	<g transform="translate(13.44 0)">
		<path
			d="M6.4 33.1L6.4 26.83L0.21 14.9L4.03 14.9L7.88 22.7L8.35 22.7L12.19 14.9L16.02 14.9L9.83 26.83L9.83 33.1Z"
			class="fill-chalk"
		/>
		<path
			d="M17.26 33.46Q16.2 33.46 15.48 32.78Q14.77 32.09 14.77 30.99Q14.77 29.9 15.48 29.21Q16.2 28.52 17.26 28.52Q18.3 28.52 19.01 29.21Q19.71 29.9 19.71 30.99Q19.71 32.09 19.01 32.78Q18.3 33.46 17.26 33.46Z"
			class="brand-spinner-stop fill-signal"
		/>
	</g>
</svg>

<style>
	.brand-spinner-arc {
		transform-origin: 50% 50%;
		animation: brand-spinner-turn 1.1s linear infinite;
	}

	.brand-spinner-stop {
		transform-box: fill-box;
		transform-origin: center;
		animation: brand-spinner-beat 1.1s ease-in-out infinite;
	}

	@keyframes brand-spinner-turn {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes brand-spinner-beat {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.7);
		}
	}
</style>
