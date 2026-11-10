<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import AgendaItemEntry from './AgendaItemEntry.svelte';
	import WithdrawnAgendaItems from './WithdrawnAgendaItems.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BoardAgendaItemView } from '$lib/data/boardMeetingView';

	let { agenda, withdrawnTitles }: { agenda: BoardAgendaItemView[]; withdrawnTitles: string[] } = $props();
</script>

<DashboardPanel title="Agenda" count={agenda.length}>
	<ol class={panelListClasses}>
		{#each agenda as item (item.id)}
			<AgendaItemEntry {item} />
		{/each}
	</ol>
	{#if agenda.length === 0}
		<p class={panelEmptyClasses}>Every item on this agenda has been withdrawn.</p>
	{/if}
	{#if withdrawnTitles.length > 0}
		<WithdrawnAgendaItems titles={withdrawnTitles} />
	{/if}
</DashboardPanel>
