<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { domainThingHref } from './domainTabs';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { DomainRule } from '$lib/data/domainReading';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let {
		rules,
		thingTitles,
		addresses,
		emptyMessage
	}: { rules: DomainRule[]; thingTitles: Map<string, string>; addresses: BusinessBrainAddresses; emptyMessage: string } = $props();

	const columns: RecordsColumn<DomainRule>[] = [
		{ key: 'rule', label: 'Rule', sortValue: (rule) => rule.title },
		{ key: 'governs', label: 'Governs' },
		{ key: 'area', label: 'Area', isWideOnly: true, sortValue: (rule) => rule.areaTitle }
	];
</script>

<RecordsTable label="Rules" {columns} rows={rules} keyOf={(rule) => rule.pageId} isCardsOnPhone {emptyMessage}>
	{#snippet cells(rule)}
		<RecordsCell kind="link" href={addresses.page(rule.pageId)}>{rule.title}</RecordsCell>
		<RecordsCell label="Governs">
			<span class="flex flex-wrap gap-x-3 gap-y-1">
				{#each rule.governs as thingSlug (thingSlug)}
					<a href={domainThingHref(thingSlug)} class="text-chalk transition hover:text-go">{thingTitles.get(thingSlug) ?? thingSlug}</a>
				{/each}
			</span>
		</RecordsCell>
		<RecordsCell isWideOnly>{rule.areaTitle}</RecordsCell>
	{/snippet}
</RecordsTable>
