<script lang="ts">
	import BatonTrack from './BatonTrack.svelte';
	import { batonStations } from './batonStations';
	import { elapsedPhrase } from '$lib/data/elapsedTime';
	import { personLabel, readTurn, type NameOf } from '$lib/data/turnLabels';
	import { postedViaChannels, turnStages, type ConversationTurn } from '$lib/data/conversationTurn';

	let {
		turn,
		nameOf,
		viewerId
	}: { turn: ConversationTurn | null; nameOf: NameOf; viewerId: string } = $props();

	const reading = $derived(turn === null ? null : readTurn(turn, nameOf, viewerId));
	const stations = $derived(turn === null ? [] : batonStations(turn, nameOf, viewerId));
	const lastWord = $derived.by(() => {
		if (turn === null) return '';
		const speaker = personLabel(turn.authorAccountId, nameOf, viewerId);
		const via = turn.postedVia === postedViaChannels.claude ? ' via Claude' : '';
		return `last word ${elapsedPhrase(turn.since)} · ${speaker}${via}`;
	});
	const isInFlight = $derived(reading?.stage === turnStages.sent);
	const accent = $derived.by(() => {
		if (reading === null || reading.stage === turnStages.quiet) return 'hairline';
		if (reading.isOnViewer) return 'signal';
		if (reading.isOnClaude) return 'caution';
		return 'go';
	});
	const borderClasses: Record<string, string> = {
		hairline: 'border-hairline',
		signal: 'border-signal/50 bg-signal/5',
		caution: 'border-caution/40 bg-caution/5',
		go: 'border-go/40 bg-go/5'
	};
</script>

<section class={`flex flex-col gap-3 rounded-xl border p-4 ${borderClasses[accent]}`}>
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">Whose turn</span>
		{#if turn !== null}
			<span class="font-display text-xs text-chalk/50">{lastWord}</span>
		{/if}
	</div>
	{#if reading === null}
		<p class="text-sm text-chalk/60">
			Nothing said yet. When you post, say who should answer — a person, or their Claude.
		</p>
	{:else}
		<p class="font-display text-lg" class:text-signal={reading.isOnViewer}>{reading.headline}</p>
		{#if stations.length > 0}
			<BatonTrack {stations} {accent} {isInFlight} />
		{/if}
		{#if reading.isOnViewer && isInFlight}
			<p class="text-xs text-chalk/60">
				Ask your Claude to read the latest messages and it will pick this up — or answer below.
			</p>
		{/if}
	{/if}
</section>
