<script lang="ts">
	import { groupKeyName, lineKeyItems, thingKeyItems } from '$lib/data/blueprint/domainDiagramKey';
	import { groupOutlineDashes, nodeOutline, relationshipDashes } from '$lib/data/blueprint/domainNodeShapes';

	const swatch = { x: 1, y: 1, width: 34, height: 16 };
	const swatchView = '0 0 36 18';
	const lineMiddle = swatch.y + swatch.height / 2;
	const itemClasses = 'flex items-center gap-2';
	const swatchClasses = 'h-[18px] w-9 shrink-0';
</script>

<ul class="flex flex-wrap gap-x-5 gap-y-2 text-xs text-chalk/70" aria-label="Key">
	{#each thingKeyItems as item (item.kind)}
		<li class={itemClasses}>
			<svg viewBox={swatchView} class={swatchClasses} aria-hidden="true">
				<path d={nodeOutline(item.kind, swatch)} class="fill-night stroke-chalk/60" />
			</svg>
			{item.name}
		</li>
	{/each}
	<li class={itemClasses}>
		<svg viewBox={swatchView} class={swatchClasses} aria-hidden="true">
			<rect {...swatch} rx="5" fill="none" stroke-dasharray={groupOutlineDashes} class="stroke-chalk/60" />
		</svg>
		{groupKeyName}
	</li>
	{#each lineKeyItems as item (item.kind)}
		<li class={itemClasses}>
			<svg viewBox={swatchView} class={swatchClasses} aria-hidden="true">
				<line x1={swatch.x} y1={lineMiddle} x2={swatch.x + swatch.width} y2={lineMiddle} stroke-width="2" stroke-dasharray={relationshipDashes[item.kind]} class="stroke-chalk/60" />
			</svg>
			{item.name}
		</li>
	{/each}
</ul>
