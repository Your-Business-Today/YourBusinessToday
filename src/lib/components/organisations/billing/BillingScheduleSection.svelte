<script lang="ts">
	import BillingScheduleLinesTable from './BillingScheduleLinesTable.svelte';
	import BillingScheduleMenu from './BillingScheduleMenu.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import type { BilledSchedule } from '$lib/data/books/organisationBilling';

	let { schedule, onEdit }: { schedule: BilledSchedule; onEdit: () => void } = $props();
</script>

<DashboardPanel title={schedule.title}>
	{#snippet toolbar()}
		<div class="flex items-start justify-between gap-3">
			<p class="text-sm text-chalk-muted">{schedule.summary}</p>
			<BillingScheduleMenu {schedule} {onEdit} />
		</div>
	{/snippet}
	<BillingScheduleLinesTable title={schedule.title} lines={schedule.lines} />
</DashboardPanel>
