<script lang="ts">
	let { isOpen }: { isOpen: boolean } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="h-3.5 w-3.5 transition-transform"
	class:rotate-90={isOpen}
	aria-hidden="true"
>
	<path d="M9 5l7 7-7 7" />
</svg>
