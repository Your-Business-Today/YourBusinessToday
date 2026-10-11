<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { startsWhenever } from '$lib/data/taskSequenceStanding';
	import { taskStatusLabelFor } from '$lib/data/taskKind';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let {
		waitsForTaskId,
		sequenceChoices
	}: { waitsForTaskId: string | null; sequenceChoices: ProjectTask[] } = $props();
</script>

<SmallCapsField label="Waits for">
	<select name="waitsForTaskId" value={waitsForTaskId ?? ''} class={fieldClasses}>
		<option value="">{startsWhenever}</option>
		{#each sequenceChoices as choice (choice.id)}
			<option value={choice.id}>
				{choice.title} — {taskStatusLabelFor(choice.kind, choice.status)}
			</option>
		{/each}
	</select>
	<span class="text-xs text-chalk/50">
		The step before this one. A series of tasks each waiting for the one before shows as a sequence.
	</span>
</SmallCapsField>
