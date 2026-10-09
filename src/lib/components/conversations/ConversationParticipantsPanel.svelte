<script lang="ts">
	import AddParticipantForm from './AddParticipantForm.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import ParticipantChip from './ParticipantChip.svelte';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let {
		people,
		participantIds
	}: { people: ProjectPerson[]; participantIds: string[] } = $props();

	const participants = $derived(people.filter((person) => participantIds.includes(person.id)));
	const outsiders = $derived(people.filter((person) => !participantIds.includes(person.id)));
</script>

<DashboardPanel title="In this conversation" count={participants.length}>
	<div class="flex flex-col gap-3 px-4 py-3">
		<p class="text-xs text-chalk/60">
			Everyone here is told of each message. Posting, being assigned or raising it joins you.
		</p>
		{#if participants.length === 0}
			<p class="text-sm text-chalk/60">
				Nobody yet — add someone on the project and they will be told what is said here.
			</p>
		{:else}
			<ul class="flex flex-wrap gap-2">
				{#each participants as person (person.id)}
					<ParticipantChip {person} />
				{/each}
			</ul>
		{/if}
		{#if outsiders.length > 0}
			<AddParticipantForm {outsiders} />
		{/if}
	</div>
</DashboardPanel>
