<script lang="ts">
	import { enhance } from '$app/forms';
	import { nobodyWaiting } from '$lib/data/batonRule';
	import { saveInPlace, submitOwnForm } from '$lib/client/fieldForms';
	import { inPlaceFieldClasses } from './internalWorkStyles';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let { todoId, ownerId, people }: { todoId: string; ownerId: string | null; people: ProjectPerson[] } = $props();
</script>

<form method="POST" action="?/setTodoOwner" use:enhance={saveInPlace}>
	<input type="hidden" name="todoId" value={todoId} />
	<select name="owner" value={ownerId ?? nobodyWaiting} onchange={submitOwnForm} aria-label="Whose this to-do is" class={[inPlaceFieldClasses, 'max-w-44']}>
		<option value={nobodyWaiting}>Anyone on the project</option>
		{#each people as person (person.id)}
			<option value={person.id}>{person.name}</option>
		{/each}
	</select>
</form>
