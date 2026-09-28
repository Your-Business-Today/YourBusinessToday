<script lang="ts">
	import { elapsedSince } from '$lib/data/elapsedTime';
	import type { TaskTurn } from '$lib/components/projects/taskRowActions';

	let { turn }: { turn: TaskTurn } = $props();

	const pillClasses = $derived.by(() => {
		if (turn.isOnViewer) return 'border-signal/60 bg-signal/10 text-signal';
		if (turn.isOnClaude) return 'border-caution/50 bg-caution/10 text-caution';
		return 'border-chalk/30 text-chalk/80';
	});
	const holderLabel = $derived(turn.isOnViewer && !turn.isOnClaude ? 'Your move' : turn.holder);
	const isInFlight = $derived(turn.stage === 'sent');
</script>

<span
	title={turn.headline}
	class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-display text-xs
		whitespace-nowrap ${pillClasses}`}
>
	<span aria-hidden="true" class:animate-pulse={isInFlight}>{turn.isOnClaude ? '✦' : '●'}</span>
	{holderLabel}
	<span class="opacity-60">· {elapsedSince(turn.since)}</span>
</span>
