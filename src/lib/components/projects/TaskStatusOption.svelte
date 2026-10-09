<script lang="ts">
	import { enhance } from '$app/forms';
	import { taskStatusLabelFor, type TaskKind } from '$lib/data/taskKind';
	import type { TaskStatus } from '$lib/data/taskStatus';
	import type { SubmitFunction } from '@sveltejs/kit';

	let {
		task,
		status,
		isSaving,
		submit
	}: {
		task: { id: string; status: TaskStatus; kind: TaskKind };
		status: TaskStatus;
		isSaving: boolean;
		submit: SubmitFunction;
	} = $props();

	const isCurrent = $derived(status === task.status);

	function optionClasses(): string {
		if (isCurrent) return 'border-go bg-go/10 text-go';
		return 'border-hairline text-chalk/80 hover:border-go hover:text-go';
	}
</script>

<form method="POST" action="?/setStatus" use:enhance={submit}>
	<input type="hidden" name="taskId" value={task.id} />
	<input type="hidden" name="status" value={status} />
	<button
		type="submit"
		disabled={isCurrent || isSaving}
		class={`w-full rounded-xl border px-4 py-3 text-left font-display text-sm transition
			disabled:cursor-default ${optionClasses()}`}
	>
		{taskStatusLabelFor(task.kind, status)}
		{#if isCurrent}
			<span class="ml-2 text-xs text-chalk/50">current</span>
		{/if}
	</button>
</form>
