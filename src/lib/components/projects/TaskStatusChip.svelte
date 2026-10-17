<script lang="ts">
	import { taskStatusLabelFor, type TaskKind } from '$lib/data/taskKind';
	import type { TaskStatus } from '$lib/data/taskStatus';

	let { status, kind }: { status: TaskStatus; kind: TaskKind } = $props();

	const statusStyles: Record<TaskStatus, string> = {
		backlog: 'border-hairline text-chalk/60',
		in_progress: 'border-caution/60 bg-caution/10 text-caution',
		on_hold: 'border-signal/50 bg-signal/10 text-signal/90',
		done: 'border-go/60 bg-go/10 text-go'
	};
</script>

<span
	title="Status — change it from Actions"
	class={`rounded-full border px-2.5 py-1 font-display text-xs whitespace-nowrap ${statusStyles[status]}`}
>
	{taskStatusLabelFor(kind, status)}
</span>
