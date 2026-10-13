<script lang="ts">
	import type { PlacedContext } from '$lib/data/blueprint/domainLayout';

	let { placed }: { placed: PlacedContext } = $props();

	const titleInset = { x: 12, y: 22 };
</script>

<g>
	<title>{placed.fullTitle}</title>
	<rect x={placed.x} y={placed.y} width={placed.width} height={placed.height} rx="12" class="fill-carriage stroke-hairline" />
	<text
		x={placed.x + titleInset.x}
		y={placed.y + titleInset.y}
		class="fill-chalk/60 font-display text-[11px] tracking-widest uppercase"
	>
		{placed.title}
	</text>
</g>
