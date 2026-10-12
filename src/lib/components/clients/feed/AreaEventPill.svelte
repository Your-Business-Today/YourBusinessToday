<script lang="ts">
	import { areaEventLabels } from '$lib/data/areaEventLabels';
	import type { AreaEventKind } from '$lib/data/areaEventKind';

	let { kind }: { kind: AreaEventKind } = $props();

	const pillStyles: Record<AreaEventKind, string> = {
		sector_claimed: 'border-caution/60 text-caution',
		sector_searched: 'border-go/60 bg-go/10 text-go',
		sighting_recorded: 'border-signal/50 text-signal/90',
		sighting_became_lead: 'border-chalk/60 text-chalk',
		lead_added_from_register: 'border-chalk/60 text-chalk',
		company_arrived: 'border-go/60 text-go',
		company_moved_in: 'border-go/40 text-go/80',
		company_left: 'border-hairline text-chalk/50',
		status_changed: 'border-caution/60 text-caution',
		accounts_category_changed: 'border-hairline text-chalk/70',
		accounts_overdue: 'border-signal/50 text-signal/90',
		charge_registered: 'border-caution/60 text-caution',
		holding_company_over_trading: 'border-signal/60 bg-signal/10 text-signal',
		observation_recorded: 'border-daylight/50 text-daylight',
		premises_opened: 'border-go/60 text-go',
		premises_reinspected: 'border-hairline text-chalk/70',
		premises_closed: 'border-hairline text-chalk/50',
		premises_changed_hands: 'border-caution/60 text-caution',
		lead_added_from_premises: 'border-chalk/60 text-chalk',
		accounts_filed: 'border-go/40 text-go/80',
		figures_read: 'border-hairline text-chalk/70',
		winding_up_petitioned: 'border-signal/60 bg-signal/10 text-signal',
		administration_opened: 'border-signal/60 bg-signal/10 text-signal',
		liquidator_appointed: 'border-signal/60 bg-signal/10 text-signal',
		place_arrived: 'border-go/60 text-go',
		place_removed: 'border-hairline text-chalk/50',
		company_incorporated: 'border-go/60 bg-go/10 text-go',
		company_dissolved: 'border-hairline text-chalk/50'
	};
</script>

<span class={`w-24 shrink-0 truncate rounded-full border px-2 py-0.5 text-center font-display text-xs sm:w-28 ${pillStyles[kind]}`}>
	{areaEventLabels[kind]}
</span>
