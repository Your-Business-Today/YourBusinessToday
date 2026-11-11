<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import PersonInitials from '$lib/components/workspace/PersonInitials.svelte';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { taskId, ownerIds, people }: { taskId: string; ownerIds: string[]; people: ProjectPerson[] } = $props();

	let isOpen = $state(false);
	const owners = $derived(people.filter((person) => ownerIds.includes(person.id)));
	const ownerNames = $derived(owners.map((owner) => owner.name).join(', '));

	const closeAfterSaving: SubmitFunction = () => {
		return async ({ update }) => {
			await update({ reset: false });
			isOpen = false;
		};
	};
</script>

<details bind:open={isOpen}>
	<summary
		aria-label={owners.length === 0 ? 'Choose who owns this' : `Owned by ${ownerNames}: change`}
		title={ownerNames}
		class="flex cursor-pointer list-none items-center -space-x-1.5 [&::-webkit-details-marker]:hidden"
	>
		{#each owners as owner (owner.id)}
			<PersonInitials name={owner.name} />
		{:else}
			<span class="text-xs text-chalk-subtle hover:text-chalk">Add owner</span>
		{/each}
	</summary>
	<form method="POST" action="?/setAssignees" use:enhance={closeAfterSaving} class="mt-2 flex flex-col gap-1.5">
		<input type="hidden" name="taskId" value={taskId} />
		{#each people as person (person.id)}
			<label class="flex items-center gap-2 text-sm text-chalk-muted">
				<input type="checkbox" name="assigneeId" value={person.id} checked={ownerIds.includes(person.id)} />
				{person.name}
			</label>
		{/each}
		<div><Button type="submit" look="primary">Save owners</Button></div>
	</form>
</details>
