<script lang="ts">
	import { relationshipKinds, type DomainRelationship } from '$lib/data/blueprint/domainModel';
	import { relationshipPath } from '$lib/data/blueprint/relationshipPath';
	import type { PlacedEntity } from '$lib/data/blueprint/domainLayout';

	let {
		relationship,
		from,
		to,
		isHighlighted
	}: { relationship: DomainRelationship; from: PlacedEntity; to: PlacedEntity; isHighlighted: boolean } = $props();

	const isContainment = $derived(relationship.kind === relationshipKinds.containment);
	const referenceDashes = '4 3';

	function lineColour(): string {
		if (!isHighlighted) return 'stroke-chalk/10';
		return isContainment ? 'stroke-go' : 'stroke-caution';
	}
</script>

<path
	d={relationshipPath(from, to)}
	fill="none"
	stroke-width={isHighlighted ? 2 : 1}
	stroke-dasharray={isContainment ? undefined : referenceDashes}
	class={`pointer-events-none transition ${lineColour()}`}
/>
