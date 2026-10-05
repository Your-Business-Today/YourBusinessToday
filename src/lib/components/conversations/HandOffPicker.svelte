<script lang="ts">
	import { accountNameLookup } from '$lib/data/accountNames';
	import { claudeLabel } from '$lib/data/turnLabels';
	import { handOffSeparator } from '$lib/data/conversationTurn';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let { people, viewerId }: { people: ProjectPerson[]; viewerId: string } = $props();

	const others = $derived(people.filter((person) => person.id !== viewerId));
	const nameOf = $derived(accountNameLookup(people));
</script>

<label class="flex flex-wrap items-center gap-2 text-sm text-chalk/60">
	<span class="font-display text-xs tracking-widest uppercase">Waiting on an answer from</span>
	<select
		name="handOff"
		title="Only when you have asked them something they must answer — an action for someone is a task assigned to them"
		class="rounded-full border border-hairline bg-transparent px-4 py-1.5 font-display text-sm
			text-chalk/80"
	>
		<option value="">Nobody — no question is open</option>
		{#each others as person (person.id)}
			<option value={[person.id, 'person'].join(handOffSeparator)}>{person.name}</option>
			<option value={[person.id, 'claude'].join(handOffSeparator)}>
				✦ {claudeLabel(person.id, nameOf, viewerId)} to answer
			</option>
		{/each}
	</select>
</label>
