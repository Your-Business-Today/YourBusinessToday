<script lang="ts">
	import DomainRulePlaces from './DomainRulePlaces.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { ruleKindWord } from './domainPlainWords';
	import { rulePlacesOf, type RulePlaceNames } from '$lib/data/domainRulePlaces';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { DomainRule } from '$lib/data/domainReading';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let {
		rules,
		names,
		organisationId,
		addresses,
		emptyMessage
	}: { rules: DomainRule[]; names: RulePlaceNames; organisationId: string; addresses: BusinessBrainAddresses; emptyMessage: string } = $props();

	const columns: RecordsColumn<DomainRule>[] = [
		{ key: 'rule', label: 'Rule', sortValue: (rule) => rule.title },
		{ key: 'kind', label: 'Kind', sortValue: (rule) => ruleKindWord(rule.ruleKind) },
		{ key: 'sitsOn', label: 'Sits on' },
		{ key: 'area', label: 'Area', isWideOnly: true, sortValue: (rule) => rule.areaTitle }
	];
</script>

<RecordsTable label="Rules" {columns} rows={rules} keyOf={(rule) => rule.pageId} isCardsOnPhone {emptyMessage}>
	{#snippet cells(rule)}
		<RecordsCell kind="link" href={addresses.page(rule.pageId)}>{rule.title}</RecordsCell>
		<RecordsCell label="Kind">{ruleKindWord(rule.ruleKind)}</RecordsCell>
		<RecordsCell label="Sits on">
			<DomainRulePlaces places={rulePlacesOf(rule, names)} {organisationId} />
		</RecordsCell>
		<RecordsCell isWideOnly>{rule.areaTitle}</RecordsCell>
	{/snippet}
</RecordsTable>
