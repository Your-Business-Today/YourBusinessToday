<script lang="ts">
	import { taskStatusLabelFor, type TaskKind } from '$lib/data/taskKind';
	import type { TaskStatus } from '$lib/data/taskStatus';

	let {
		status,
		kind = 'work',
		onOpenPicker
	}: { status: TaskStatus; kind?: TaskKind; onOpenPicker: () => void } = $props();

	const statusStyles: Record<TaskStatus, string> = {
		backlog: 'border-hairline text-chalk/70 hover:border-chalk/50',
		in_progress: 'border-caution/60 text-caution hover:border-caution',
		on_hold: 'border-signal/50 text-signal/90 hover:border-signal',
		done: 'border-go/60 text-go hover:border-go'
	};
</script>

<button
	type="button"
	onclick={onOpenPicker}
	title="Change status"
	class={`w-24 truncate rounded-full border px-2 py-1 font-display text-xs sm:w-28 transition ${statusStyles[status]}`}
>
	{taskStatusLabelFor(kind, status)}
</button>
