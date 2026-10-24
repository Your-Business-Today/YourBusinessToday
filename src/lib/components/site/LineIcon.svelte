<script lang="ts">
	import { lineIconPaths, type LineIconKind } from './lineIcons';

	let { kind, class: extraClasses = '' }: { kind: LineIconKind; class?: string } = $props();

	const paths = $derived(lineIconPaths[kind]);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={extraClasses}
	aria-hidden="true"
>
	{#each paths as path (path)}
		<path d={path} />
	{/each}
</svg>
