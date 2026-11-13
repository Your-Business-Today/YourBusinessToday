<script lang="ts">
	import type { LineName } from './layout/lineMapLayout';
	import { LabelFonts } from './layout/textMeasure';

	let { lineName }: { lineName: LineName } = $props();

	const { line: font } = LabelFonts;
</script>

<text text-anchor="end" class="fill-chalk font-display text-sm font-semibold">
	{#each lineName.lines as line, index (index)}
		<tspan x={lineName.right} y={lineName.y + font.baseline + index * font.lineHeight}>{line}</tspan>
	{/each}
</text>
