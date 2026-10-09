<script lang="ts">
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let { outsiders }: { outsiders: ProjectPerson[] } = $props();

	const tracker = new FormTracker();
</script>

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
	<SubmitButton isSaving={tracker.isSaving} savingLabel="Adding…" class={panelButtonClasses}>
		Add
	</SubmitButton>
</form>
