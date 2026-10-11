<script lang="ts">
	import { startsWhenever } from '$lib/data/taskSequenceStanding';
	import { taskStatusLabelFor } from '$lib/data/taskKind';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let {
		waitsForTaskId,
		sequenceChoices
	}: { waitsForTaskId: string | null; sequenceChoices: ProjectTask[] } = $props();

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
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
