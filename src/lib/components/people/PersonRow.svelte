<script lang="ts">
	import StageDots from './StageDots.svelte';
	import WarmthPill from './WarmthPill.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { PersonSummary } from '$lib/server/people/getPeople';

	let { person }: { person: PersonSummary } = $props();

	function describeNextAction(person: PersonSummary): string {
		if (person.nextAction === '') return 'Nothing planned';
		if (person.nextActionDue === null) return person.nextAction;
		return `${person.nextAction} by ${formatBritishDate(person.nextActionDue)}`;
	}
</script>

<li class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
	<div class="min-w-0">
		<p class="font-display">
			<a href={`/people/${person.id}`} class="hover:text-signal">{person.name}</a>
			{#if person.isDecisionMaker}
				<span class="ml-2 text-xs text-go">Decision maker</span>
			{/if}
		</p>
		<p class="text-xs text-chalk/50">{describeNextAction(person)}</p>
	</div>
	<div class="flex flex-wrap items-center gap-3">
		<StageDots stages={person.companyStages} />
		<WarmthPill warmth={person.warmth} />
	</div>
</li>
