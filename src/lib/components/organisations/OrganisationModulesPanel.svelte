<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import OrganisationModuleCells from './OrganisationModuleCells.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { organisationModuleLabels, organisationModules, type OrganisationModule } from '$lib/data/organisationModules';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { modules, canSwitch }: { modules: OrganisationModule[]; canSwitch: boolean } = $props();

	const moduleColumns: RecordsColumn<OrganisationModule>[] = [
		{ key: 'module', label: 'Module', sortValue: (module) => organisationModuleLabels[module] },
		{ key: 'status', label: 'Status' }
	];
	const actionsColumn: RecordsColumn<OrganisationModule> = { key: 'actions', label: '' };
	const columns = $derived(canSwitch ? [...moduleColumns, actionsColumn] : moduleColumns);
	const shownModules = $derived(canSwitch ? [...organisationModules] : modules);
</script>

<DashboardPanel>
	<RecordsTable label="Modules" {columns} rows={shownModules} keyOf={(module) => module} isCardsOnPhone emptyMessage="No module is switched on.">
		{#snippet cells(module)}
			<OrganisationModuleCells {module} isOn={modules.includes(module)} {canSwitch} />
		{/snippet}
	</RecordsTable>
</DashboardPanel>
