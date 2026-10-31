<script lang="ts">
	import TaskReferenceLink from '$lib/components/projects/TaskReferenceLink.svelte';
	import type { SequenceStanding } from '$lib/data/taskSequenceStanding';

	let { standing, projectId }: { standing: SequenceStanding; projectId: string } = $props();

	const reference = $derived({
		projectId,
		taskId: standing.waitedForId,
		department: standing.waitedForDepartment
	});

	const noteClasses = $derived(
		standing.isWaiting
			? 'border-signal/50 bg-signal/10 text-signal hover:border-signal hover:bg-signal/20'
			: 'border-hairline text-chalk/55 hover:border-chalk/40 hover:text-chalk'
	);
	const symbol = $derived(standing.isWaiting ? '⏸' : '✓');
	const outcome = $derived(standing.isWaiting ? 'must be done first' : 'is done');
</script>

<TaskReferenceLink
	{reference}
	title={`“${standing.waitedForTitle}” ${outcome} — open it`}
	class={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 font-display
		text-xs transition ${noteClasses}`}
>
	<span aria-hidden="true">{symbol}</span>
	<span class="truncate">{standing.waitedForTitle}</span>
	<span class="shrink-0 opacity-70">· {outcome}</span>
</TaskReferenceLink>
