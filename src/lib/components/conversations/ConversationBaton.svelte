<script lang="ts">
	import BatonStationNode from './BatonStationNode.svelte';
	import { batonStations } from './batonTrack';
	import { elapsedPhrase } from '$lib/data/elapsedTime';
	import { personLabel, readTurn, type NameOf } from '$lib/data/turnLabels';
	import type { ConversationTurn } from '$lib/data/conversationTurn';

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
		const via = turn.postedVia === 'claude' ? ' via Claude' : '';
		return `last word ${elapsedPhrase(turn.since)} · ${speaker}${via}`;
	});
	const isInFlight = $derived(reading?.stage === 'sent');
	const accent = $derived.by(() => {
		if (reading === null || reading.stage === 'quiet') return 'hairline';
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

<section class={`flex flex-col gap-4 rounded-2xl border p-5 ${borderClasses[accent]}`}>
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
			<ol class="flex items-start overflow-x-auto pb-1">
				{#each stations as station, stationIndex (station.key)}
					{#if stationIndex > 0}
						<li aria-hidden="true" class="relative mt-[1.1rem] h-0.5 min-w-8 flex-1">
							<span
								class="absolute inset-0 rounded-full"
								class:bg-chalk={!station.isHandOffBefore}
								class:opacity-20={!station.isHandOffBefore}
								class:baton-line={station.isHandOffBefore}
							></span>
							{#if station.isHandOffBefore && isInFlight}
								<span class="baton-dot"></span>
							{/if}
						</li>
					{/if}
					<BatonStationNode {station} {accent} />
				{/each}
			</ol>
		{/if}
		{#if reading.isOnViewer && isInFlight}
			<p class="text-xs text-chalk/60">
				Ask your Claude to read the latest messages and it will pick this up — or answer below.
			</p>
		{/if}
	{/if}
</section>

<style>
	.baton-line {
		background-image: linear-gradient(
			to right,
			var(--color-chalk) 0 50%,
			transparent 50% 100%
		);
		background-size: 8px 2px;
		opacity: 0.4;
	}
	.baton-dot {
		position: absolute;
		top: 50%;
		left: 0;
		height: 0.625rem;
		width: 0.625rem;
		border-radius: 9999px;
		background-color: var(--color-caution);
		box-shadow: 0 0 12px var(--color-caution);
		transform: translate(-50%, -50%);
		animation: baton-run 2.4s ease-in-out infinite;
	}
	@keyframes baton-run {
		from {
			left: 0;
		}
		to {
			left: 100%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.baton-dot {
			animation: none;
			left: 50%;
		}
	}
</style>
