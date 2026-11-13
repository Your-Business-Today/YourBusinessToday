<script lang="ts">
	import { groupOutlineDashes } from '$lib/data/blueprint/domainNodeShapes';
	import type { PlacedGroup } from '$lib/data/blueprint/domainLayout';

	let { placed }: { placed: PlacedGroup } = $props();

	const titleInset = { x: 10, y: 17 };
</script>

<g>
	<title>{placed.fullTitle}</title>
	<rect
		x={placed.x}
		y={placed.y}
		width={placed.width}
		height={placed.height}
		rx="10"
		fill="none"
		stroke-dasharray={groupOutlineDashes}
		class="stroke-chalk/40"
	/>
	<text x={placed.x + titleInset.x} y={placed.y + titleInset.y} class="fill-chalk/60 text-[11px] italic">{placed.title}</text>
</g>
