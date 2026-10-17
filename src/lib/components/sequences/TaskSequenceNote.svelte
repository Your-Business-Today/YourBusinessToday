<script lang="ts">
	import type { SequenceStanding } from '$lib/data/taskSequenceStanding';

	let { standing }: { standing: SequenceStanding } = $props();

	const noteClasses = $derived(
		standing.isWaiting ? 'border-signal/50 bg-signal/10 text-signal' : 'border-hairline text-chalk/55'
	);
	const symbol = $derived(standing.isWaiting ? '⏸' : '✓');
	const outcome = $derived(standing.isWaiting ? 'must be done first' : 'is done');
</script>

<span
	title={`“${standing.waitedForTitle}” ${outcome}`}
	class={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 font-display
		text-xs ${noteClasses}`}
>
	<span aria-hidden="true">{symbol}</span>
	<span class="truncate">{standing.waitedForTitle}</span>
	<span class="shrink-0 opacity-70">· {outcome}</span>
</span>
