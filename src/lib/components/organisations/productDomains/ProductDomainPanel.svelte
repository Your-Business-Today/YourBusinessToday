<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { panelEmptyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import type { ProductDomain, ProductEntity } from '$lib/data/organisationProductDomains';

	let { productDomain }: { productDomain: ProductDomain } = $props();

	const { entities, isRead } = $derived(productDomain);

	const columns: RecordsColumn<ProductEntity>[] = [
		{ key: 'entity', label: 'Entity', sortValue: (entity) => entity.title },
		{ key: 'context', label: 'Context', sortValue: (entity) => entity.contextTitle },
		{ key: 'fields', label: 'Fields', isFigure: true, sortValue: (entity) => entity.fieldCount }
	];
</script>

<DashboardPanel title={productDomain.productName} count={isRead ? entities.length : null}>
	{#snippet actions()}
		<a href={productDomain.domainHref} class="font-display text-sm text-chalk-subtle transition hover:text-chalk">Open its Domain</a>
	{/snippet}
	{#if isRead}
		<RecordsTable
			label={`${productDomain.productName} entities`}
			{columns}
			rows={entities}
			keyOf={(entity) => entity.name}
			hrefOf={(entity) => entity.href}
			isDense
			emptyMessage="Its domain names no entities."
		>
			{#snippet cells(entity)}
				<RecordsCell kind="link" href={entity.href}>{entity.title}</RecordsCell>
				<RecordsCell>{entity.contextTitle}</RecordsCell>
				<RecordsCell kind="figure">{entity.fieldCount}</RecordsCell>
			{/snippet}
		</RecordsTable>
	{:else}
		<p class={panelEmptyClasses}>No domain has been read from its repository yet. Its Domain tab reads it from GitHub.</p>
	{/if}
</DashboardPanel>
