<script lang="ts">
	import PersonFacts from './PersonFacts.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { confirmButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { leadSourceLabels } from '$lib/data/leadSources';
	import type { Person } from '$lib/server/people/personRecord';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { person, onEdit }: { person: Person; onEdit: () => void } = $props();

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
			<form method="POST" action="?/researchPerson">
				<input type="hidden" name="personId" value={person.id} />
				<SubmitButton class={quietButtonClasses} savingLabel="Searching…">Find on the web</SubmitButton>
			</form>
			<form method="POST" action="?/draftApproach">
				<input type="hidden" name="personId" value={person.id} />
				<SubmitButton class={confirmButtonClasses} savingLabel="Drafting…">Draft approach</SubmitButton>
			</form>
		</div>
	</div>
	<PersonFacts {person} />
</div>
