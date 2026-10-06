<script lang="ts">
	import { isAwaitingAnswer, supportTaskKind, type TaskKind } from '$lib/data/taskKind';
	import type { TaskStatus } from '$lib/data/taskStatus';

	let { kind, status }: { kind: TaskKind; status: TaskStatus } = $props();

	const pillClasses = $derived(
		isAwaitingAnswer(kind, status)
			? 'border-signal/60 text-signal'
			: 'border-caution/50 text-caution/80'
	);
</script>

{#if kind === supportTaskKind}
	<span
		title={isAwaitingAnswer(kind, status) ? 'Support task awaiting an answer' : 'Support task'}
		class={`rounded-full border px-2 py-0.5 font-display text-xs ${pillClasses}`}
	>
		Support
	</span>
{/if}
