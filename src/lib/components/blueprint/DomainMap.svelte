<script lang="ts">
	import DomainContextBox from './DomainContextBox.svelte';
	import DomainEntityNode from './DomainEntityNode.svelte';
	import DomainRelationshipLine from './DomainRelationshipLine.svelte';
	import { layOutDomain, type PlacedEntity } from '$lib/data/blueprint/domainLayout';
	import { relatedEntityNames, relationshipKey, type DomainModel, type DomainRelationship } from '$lib/data/blueprint/domainModel';

	let {
		domain,
		selectedEntityName,
		onSelect
	}: { domain: DomainModel; selectedEntityName: string | null; onSelect: (entityName: string) => void } = $props();

	const layout = $derived(layOutDomain(domain));
	const placedByName = $derived(new Map(layout.entities.map((placed) => [placed.name, placed])));
	const lines = $derived(domain.relationships.flatMap(placedLine));
	const relatedNames = $derived(selectedEntityName === null ? new Set<string>() : relatedEntityNames(domain, selectedEntityName));

	function placedLine(relationship: DomainRelationship) {
		const from = placedByName.get(relationship.fromEntityName);
		const to = placedByName.get(relationship.toEntityName);
		if (from === undefined || to === undefined) return [];
		return [{ key: relationshipKey(relationship), relationship, from, to }];
	}

	function isTouchingSelection(relationship: DomainRelationship): boolean {
		if (selectedEntityName === null) return false;
		return relationship.fromEntityName === selectedEntityName || relationship.toEntityName === selectedEntityName;
	}

	function select(placed: PlacedEntity) {
		onSelect(placed.name);
	}
</script>

<div class="overflow-x-auto rounded-xl border border-hairline bg-night">
	<svg
		viewBox={`0 0 ${layout.width} ${layout.height}`}
		class="block h-auto w-full min-w-[40rem]"
		role="img"
		aria-label="The domain's contexts, entities and the relationships between them"
	>
		{#each layout.contexts as placed (placed.name)}
			<DomainContextBox {placed} />
		{/each}
		{#each lines as line (line.key)}
			<DomainRelationshipLine {...line} isHighlighted={isTouchingSelection(line.relationship)} />
		{/each}
		{#each layout.entities as placed (placed.name)}
			<DomainEntityNode
				{placed}
				isSelected={placed.name === selectedEntityName}
				isRelated={relatedNames.has(placed.name)}
				onSelect={() => select(placed)}
			/>
		{/each}
	</svg>
</div>
