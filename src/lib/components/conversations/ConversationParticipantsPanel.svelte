<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import ParticipantChip from './ParticipantChip.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let {
		people,
		participantIds
	}: { people: ProjectPerson[]; participantIds: string[] } = $props();

	const tracker = new FormTracker();

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
			<form
				method="POST"
				action="?/addParticipant"
				use:enhance={tracker.submit()}
				class="flex items-center gap-2"
			>
				<select
					name="accountId"
					required
					class="min-w-0 flex-1 rounded-full border border-hairline bg-night px-3 py-1 font-display text-sm
						text-chalk/80"
				>
					<option value="" disabled selected>Add someone…</option>
					{#each outsiders as person (person.id)}
						<option value={person.id}>{person.name}</option>
					{/each}
				</select>
				<SubmitButton
					isSaving={tracker.isSaving}
					savingLabel="Adding…"
					class={panelButtonClasses}
				>
					Add
				</SubmitButton>
			</form>
		{/if}
	</div>
</DashboardPanel>
