<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import OrganisationModuleRow from './OrganisationModuleRow.svelte';
	import { organisationModules, type OrganisationModule } from '$lib/data/organisationModules';

	let { modules, canSwitch }: { modules: OrganisationModule[]; canSwitch: boolean } = $props();

	const shownModules = $derived(canSwitch ? [...organisationModules] : modules);
</script>

{#if shownModules.length > 0}
	<DashboardPanel title="Modules">
		<ul class="divide-y divide-hairline">
			{#each shownModules as module (module)}
				<OrganisationModuleRow {module} isOn={modules.includes(module)} {canSwitch} />
			{/each}
		</ul>
	</DashboardPanel>
{/if}
