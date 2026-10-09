<script lang="ts">
	import type { SequenceStanding } from '$lib/data/taskSequenceStanding';

	let { standing }: { standing: SequenceStanding | null } = $props();

	const pillClasses = $derived(
		standing?.isWaiting ? 'border-signal/60 bg-signal/10 text-signal' : 'border-hairline text-chalk/60'
	);
	const verb = $derived(standing?.isWaiting ? 'Waits for' : 'After');
	const hint = $derived(
		standing?.isWaiting
			? `Waiting for “${standing.waitedForTitle}” to be done before this can start`
			: `Follows “${standing?.waitedForTitle}”, which is done`
	);
</script>

{#if standing !== null}
	<span
		title={hint}
		class={`inline-flex max-w-56 items-center gap-1 rounded-full border px-2 py-0.5 font-display
			text-xs whitespace-nowrap ${pillClasses}`}
	>
		<span aria-hidden="true">⇢</span>
		<span class="truncate">{verb} {standing.waitedForTitle}</span>
	</span>
{/if}
