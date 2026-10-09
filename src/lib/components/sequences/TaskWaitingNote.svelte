<script lang="ts">
	import { taskStatusLabelFor } from '$lib/data/taskKind';
	import { waitingNoteSentence } from './waitingNoteSentence';
	import type { TaskSequence } from '$lib/data/taskSequence';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		task,
		sequence,
		waitedForAssigneeNames
	}: {
		task: ProjectTask;
		sequence: TaskSequence<ProjectTask> | null;
		waitedForAssigneeNames: string[];
	} = $props();

	const note = $derived(waitingNoteSentence(task, sequence, waitedForAssigneeNames));
	const waitedFor = $derived(sequence?.waitingFor ?? null);
	const toneClasses = $derived(
		waitedFor === null
			? 'border-go/50 bg-go/10 text-go'
			: 'border-signal/50 bg-signal/10 text-signal'
	);
</script>

{#if note !== null && sequence !== null}
	<div class={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-sm ${toneClasses}`}>
		<p class="font-display">{note.headline}</p>
		{#if waitedFor !== null}
			<a
				href={`/projects/${waitedFor.projectId}/tasks/${waitedFor.id}`}
				class="truncate text-chalk/80 underline underline-offset-4 transition hover:text-chalk"
			>
				{waitedFor.title} — {taskStatusLabelFor(waitedFor.kind, waitedFor.status)}{note.withWhom}
			</a>
		{/if}
	</div>
{/if}
