<script lang="ts">
	import PersonFacts from './PersonFacts.svelte';
	import {
		confirmButtonClasses,
		dangerButtonClasses,
		quietButtonClasses
	} from '$lib/components/site/formStyles';
	import { leadSourceLabels } from '$lib/data/leadSources';
	import type { Person } from '$lib/server/people/personRecord';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let {
		person,
		onEdit,
		onResearch,
		onDraftApproach,
		onDelete
	}: {
		person: Person;
		onEdit: () => void;
		onResearch: () => void;
		onDraftApproach: () => void;
		onDelete: () => void;
	} = $props();

	const contactLine = $derived(
		[person.email, person.phone, leadSourceLabels[person.leadSource]].filter(Boolean).join(' · ')
	);
</script>

<div class="flex flex-col gap-3">
	<a href="/people" class="font-display text-sm text-chalk/50 hover:text-chalk">← People</a>
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="flex flex-col gap-1">
			<PageTitle>{person.name}</PageTitle>
			<p class="text-chalk/70">{contactLine}</p>
			{#if person.officerId !== null}
				<p class="text-xs text-chalk/40">Companies House officer {person.officerId}</p>
			{/if}
		</div>
		<div class="flex flex-wrap gap-2">
			<button type="button" class={quietButtonClasses} onclick={onEdit}>Edit</button>
			<button type="button" class={quietButtonClasses} onclick={onResearch}>Ask your Claude to research</button>
			<button type="button" class={confirmButtonClasses} onclick={onDraftApproach}>Ask your Claude to draft the approach</button>
			<button type="button" class={dangerButtonClasses} onclick={onDelete}>Delete</button>
		</div>
	</div>
	<PersonFacts {person} />
</div>
