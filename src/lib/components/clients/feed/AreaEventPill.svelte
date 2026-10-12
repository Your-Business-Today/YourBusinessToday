<script lang="ts">
	import { areaEventLabels, type AreaEventKind } from '$lib/data/areaEventKind';

	let { kind }: { kind: AreaEventKind } = $props();

	const pillStyles: Record<AreaEventKind, string> = {
		sector_claimed: 'border-caution/60 text-caution',
		sector_searched: 'border-go/60 bg-go/10 text-go',
		sighting_recorded: 'border-signal/50 text-signal/90',
		sighting_became_lead: 'border-chalk/60 text-chalk',
		lead_added_from_register: 'border-chalk/60 text-chalk'
	};
</script>

<span class={`w-24 shrink-0 truncate rounded-full border px-2 py-0.5 text-center font-display text-xs sm:w-28 ${pillStyles[kind]}`}>
	{areaEventLabels[kind]}
</span>
