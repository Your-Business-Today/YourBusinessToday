<script lang="ts">
	import type { BatonStation } from './batonStations';

	let { station, accent }: { station: BatonStation; accent: string } = $props();

	const holdingClasses: Record<string, string> = {
		signal: 'border-signal bg-signal/20 text-signal ring-4 ring-signal/20',
		caution: 'border-caution bg-caution/20 text-caution ring-4 ring-caution/20',
		go: 'border-go bg-go/20 text-go ring-4 ring-go/20',
		hairline: 'border-hairline text-chalk/60'
	};
	const stateClasses = $derived.by(() => {
		if (station.state === 'holding') return `${holdingClasses[accent]} animate-pulse`;
		if (station.state === 'spoke') return 'border-chalk/50 bg-carriage text-chalk';
		if (station.state === 'next') return 'border-dashed border-chalk/30 text-chalk/40';
		return 'border-chalk/15 text-chalk/35';
	});
	const mark = $derived(station.isClaude ? '✦' : station.label.charAt(0).toUpperCase());
	const caption = $derived.by(() => {
		if (station.state === 'holding') return 'has it';
		if (station.state === 'spoke') return 'spoke';
		if (station.state === 'next') return 'next';
		return '';
	});
</script>

<li class="flex w-24 shrink-0 flex-col items-center gap-1 text-center">
	<span
		class={`grid h-9 w-9 place-items-center rounded-full border font-display text-sm transition
			${stateClasses}`}
	>
		{mark}
	</span>
	<span class="w-full truncate text-xs text-chalk/80" title={station.label}>{station.label}</span>
	{#if caption !== ''}
		<span class="font-display text-[0.65rem] tracking-widest text-chalk/40 uppercase">
			{caption}
		</span>
	{/if}
</li>
