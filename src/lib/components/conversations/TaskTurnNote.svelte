<script lang="ts">
	import { elapsedPhrase } from '$lib/data/elapsedTime';
	import { turnStages } from '$lib/data/conversationTurn';
	import type { TaskTurn } from '$lib/components/projects/taskRowActions';

	let { turn }: { turn: TaskTurn } = $props();

	const noteClasses = $derived.by(() => {
		if (turn.isOnViewer) return 'border-signal/50 bg-signal/10 text-signal';
		if (turn.isOnClaude) return 'border-caution/40 bg-caution/10 text-caution';
		return 'border-hairline text-chalk/75';
	});
	const holderLabel = $derived(turn.isOnViewer && !turn.isOnClaude ? 'You' : turn.holder);
	const isInFlight = $derived(turn.stage === turnStages.sent);
</script>

<span
	title={turn.headline}
	class={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 font-display
		text-xs ${noteClasses}`}
>
	<span aria-hidden="true" class:animate-pulse={isInFlight}>{turn.isOnClaude ? '✦' : '●'}</span>
	<span class="truncate">{holderLabel}</span>
	<span class="shrink-0 opacity-70">· {elapsedPhrase(turn.since)}</span>
</span>
