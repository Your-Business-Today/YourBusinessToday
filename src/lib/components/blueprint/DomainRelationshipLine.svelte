<script lang="ts">
	import { relationshipKinds, type DomainRelationship, type RelationshipKind } from '$lib/data/blueprint/domainModel';
	import { relationshipDashes } from '$lib/data/blueprint/domainNodeShapes';
	import { relationshipPath } from '$lib/data/blueprint/relationshipPath';
	import type { PlacedEntity } from '$lib/data/blueprint/domainLayout';

	let {
		relationship,
		from,
		to,
		isHighlighted
	}: { relationship: DomainRelationship; from: PlacedEntity; to: PlacedEntity; isHighlighted: boolean } = $props();

	const highlightColours: Record<RelationshipKind, string> = {
		[relationshipKinds.containment]: 'stroke-go',
		[relationshipKinds.reference]: 'stroke-caution',
		[relationshipKinds.marks]: 'stroke-chalk/70'
	};

	function lineColour(): string {
		if (!isHighlighted) return 'stroke-chalk/10';
		return highlightColours[relationship.kind];
	}
</script>

<path
	d={relationshipPath(from, to)}
	fill="none"
	stroke-width={isHighlighted ? 2 : 1}
	stroke-dasharray={relationshipDashes[relationship.kind]}
	class={`pointer-events-none transition ${lineColour()}`}
/>
