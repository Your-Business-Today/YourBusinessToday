<script lang="ts">
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses, quietButtonClasses, selectClasses } from '$lib/components/site/formStyles';
	import type { GroupParent } from '$lib/server/clients/listGroupParents';

	let {
		clientId,
		parents,
		action = '?/groupUnder'
	}: { clientId: string; parents: GroupParent[]; action?: string } = $props();

	const newParentChoice = '';

	let chosenParentId = $state(newParentChoice);
</script>

<form method="POST" {action} class="flex flex-wrap items-center gap-2">
	<input type="hidden" name="clientId" value={clientId} />
	<select
		name="parentClientId"
		bind:value={chosenParentId}
		aria-label="Group"
		class={`${selectClasses} py-1 text-sm`}
	>
		<option value={newParentChoice}>New group…</option>
		{#each parents as parent (parent.id)}
			<option value={parent.id}>{parent.name}</option>
		{/each}
	</select>
	{#if chosenParentId === newParentChoice}
		<input
			name="newParentName"
			required
			placeholder="Group name"
			aria-label="New group name"
			class={`${inputClasses} min-w-0 flex-1 py-1 text-sm`}
		/>
	{/if}
	<SubmitButton class={quietButtonClasses}>Group under</SubmitButton>
</form>
