<script lang="ts">
	import { accountNameLookup } from '$lib/data/accountNames';
	import { claudeLabel } from '$lib/data/turnLabels';
	import { handOffSeparator } from '$lib/data/conversationTurn';
	import { askKindLabels, askKindMeanings, askKindOrder } from '$lib/data/askKind';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let { people, viewerId }: { people: ProjectPerson[]; viewerId: string } = $props();

	const others = $derived(people.filter((person) => person.id !== viewerId));
	const nameOf = $derived(accountNameLookup(people));
</script>

<label class="flex flex-wrap items-center gap-2 text-sm text-chalk/60">
	<span class="font-display text-xs tracking-widest uppercase">Waiting on an answer from</span>
	<select
		name="handOff"
		title="Only when you are asking them for something: information, setup or testing"
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
<label class="flex flex-wrap items-center gap-2 text-sm text-chalk/60">
	<span class="font-display text-xs tracking-widest uppercase">Asking for</span>
	<select
		name="askKind"
		title="What the ask wants from them, when it waits on someone"
		class="rounded-full border border-hairline bg-transparent px-4 py-1.5 font-display text-sm
			text-chalk/80"
	>
		{#each askKindOrder as kind (kind)}
			<option value={kind} title={askKindMeanings[kind]}>{askKindLabels[kind]}</option>
		{/each}
	</select>
</label>
