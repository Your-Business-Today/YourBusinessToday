<script lang="ts">
	import { relationshipPath, type MapBox } from '$lib/data/blueprint/relationshipPath';

	let { from, to, arrowId, isHighlighted }: { from: MapBox; to: MapBox; arrowId: string; isHighlighted: boolean } =
		$props();
</script>

<path
	d={relationshipPath(from, to)}
	fill="none"
	stroke-width={isHighlighted ? 2 : 1}
	marker-end={`url(#${arrowId})`}
	class={['pointer-events-none transition', isHighlighted ? 'stroke-go' : 'stroke-chalk/15']}
/>
