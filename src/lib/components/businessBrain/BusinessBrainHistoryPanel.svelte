<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { formatUkDateTime } from '$lib/data/britishDate';
	import { historyLineClasses } from './businessBrainHistory';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { BusinessBrainPageRead } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
	import type { BusinessBrainRevisionEntry, BusinessBrainRevisionRead } from '$lib/server/businessBrain/readBusinessBrainPageHistory';

	let {
		page,
		history,
		revisionShown,
		addresses
	}: {
		page: BusinessBrainPageRead;
		history: { entries: BusinessBrainRevisionEntry[]; revisionCount: number };
		revisionShown: BusinessBrainRevisionRead | null;
		addresses: BusinessBrainAddresses;
	} = $props();

	const shownRevisionId = $derived(revisionShown?.revisionId ?? null);
	const isCurrentShown = $derived(shownRevisionId === null);
</script>

<DashboardPanel title="History" count={history.revisionCount}>
	<ul class={panelListClasses}>
		<li>
			<a href={addresses.page(page.pageId)} aria-current={isCurrentShown ? 'page' : undefined} class={historyLineClasses(isCurrentShown)}>
				<span class="font-display">As it now reads</span>
				<span class="text-xs text-chalk-subtle">{formatUkDateTime(page.updatedAt)}</span>
			</a>
		</li>
		{#each history.entries as entry (entry.revisionId)}
			{@const isShown = entry.revisionId === shownRevisionId}
			<li>
				<a href={addresses.revision(page.pageId, entry.revisionId)} aria-current={isShown ? 'page' : undefined} class={historyLineClasses(isShown)}>
					<span class="truncate font-display">{entry.title}</span>
					<span class="text-xs text-chalk-subtle">Until {formatUkDateTime(entry.revisedAt)}</span>
				</a>
			</li>
		{/each}
	</ul>
</DashboardPanel>
