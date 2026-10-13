<script lang="ts">
	import EntityLink from './EntityLink.svelte';
	import { relationshipKey, type DomainRelationship } from '$lib/data/blueprint/domainModel';
	import { relationshipSentence } from '$lib/data/blueprint/relationshipSentence';

	let {
		entityName,
		relationships,
		onSelect
	}: { entityName: string; relationships: DomainRelationship[]; onSelect: (entityName: string) => void } = $props();

	const sentences = $derived(
		relationships.map((relationship) => ({ key: relationshipKey(relationship), ...relationshipSentence(relationship, entityName) }))
	);
</script>

<section class="flex flex-col gap-1.5">
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Relationships</h3>
	<ul class="flex flex-col gap-1">
		{#each sentences as sentence (sentence.key)}
			<li class="text-chalk/70">
				{sentence.before} <EntityLink entityName={sentence.otherEntityName} {onSelect} />{sentence.after}
			</li>
		{/each}
	</ul>
</section>
