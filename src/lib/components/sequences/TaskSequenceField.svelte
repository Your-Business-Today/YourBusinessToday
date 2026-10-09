<script lang="ts">
	import { startsWhenever } from '$lib/data/taskSequenceStanding';
	import { taskStatusLabelFor } from '$lib/data/taskKind';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		waitsForTaskId,
		sequenceChoices
	}: { waitsForTaskId: string | null; sequenceChoices: ProjectTask[] } = $props();

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<label class="flex flex-col gap-1">
	<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Waits for</span>
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
</label>
