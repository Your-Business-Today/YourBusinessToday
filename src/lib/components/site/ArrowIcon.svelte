<script lang="ts">
	let { direction }: { direction: 'up' | 'down' } = $props();

	const headPath = $derived(direction === 'up' ? 'M6 10l6-6 6 6' : 'M6 14l6 6 6-6');
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="h-3.5 w-3.5"
	aria-hidden="true"
>
	<path d="M12 4v16" />
	<path d={headPath} />
</svg>
