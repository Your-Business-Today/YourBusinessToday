<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import PortalPersonRow from './PortalPersonRow.svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { PortalPerson } from '$lib/portal/portalPerson';
	import type { PortalVisitor } from '$lib/portal/portalVisitor';

	let { people, visitor }: { people: PortalPerson[]; visitor: PortalVisitor } = $props();
</script>

<DashboardPanel title="People at your organisation" count={people.length}>
	<ul class={panelListClasses}>
		{#each people as person (person.contactId)}
			<PortalPersonRow {person} canManage={visitor.isAdministrator && person.contactId !== visitor.contactId} />
		{/each}
	</ul>
</DashboardPanel>
