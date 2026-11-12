<script lang="ts">
	import InvoicingDetailsPanel from './InvoicingDetailsPanel.svelte';
	import OrganisationDirectorsPanel from './OrganisationDirectorsPanel.svelte';
	import OrganisationModulesPanel from './OrganisationModulesPanel.svelte';
	import OrganisationPeoplePanel from './OrganisationPeoplePanel.svelte';
	import OrganisationProjectsPanel from './OrganisationProjectsPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { organisationOverviewTabs, organisationOverviewTabsFor } from './organisationOverviewTabs';
	import type { BoardroomDirector } from '$lib/data/boardroomDirector';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';
	import type { OrganisationModule } from '$lib/data/organisationModules';
	import type { ReachableOrganisationProject } from '$lib/server/organisations/markReachableProjects';

	let {
		organisation,
		projects,
		members,
		modules,
		directors,
		canManage,
		isStaff
	}: {
		organisation: Organisation;
		projects: ReachableOrganisationProject[];
		members: OrganisationMember[];
		modules: OrganisationModule[];
		directors: BoardroomDirector[];
		canManage: boolean;
		isStaff: boolean;
	} = $props();

	let selectedTab = $state<string>(organisationOverviewTabs.projects);

	const hasBoardroom = $derived(modules.includes('boardroom'));
	const tabs = $derived(
		organisationOverviewTabsFor({
			projectCount: projects.length,
			memberCount: members.length,
			switchedOnModuleCount: modules.length,
			hasModulesTab: isStaff || modules.length > 0,
			directorCount: hasBoardroom ? directors.length : null
		})
	);
	const shownTab = $derived(tabs.some((tab) => tab.key === selectedTab) ? selectedTab : organisationOverviewTabs.projects);
	const narrowPanelClasses = 'w-full max-w-3xl';
</script>

<nav aria-label={`${organisation.name} overview`}>
	<TabStrip {tabs} bind:selectedKey={selectedTab} />
</nav>

{#if shownTab === organisationOverviewTabs.projects}
	<OrganisationProjectsPanel {organisation} {projects} />
{:else}
	<div class={narrowPanelClasses}>
		{#if shownTab === organisationOverviewTabs.people}
			<OrganisationPeoplePanel {organisation} {members} {canManage} />
		{:else if shownTab === organisationOverviewTabs.invoicing}
			<InvoicingDetailsPanel {organisation} {canManage} />
		{:else if shownTab === organisationOverviewTabs.modules}
			<OrganisationModulesPanel {modules} canSwitch={isStaff} />
		{:else if shownTab === organisationOverviewTabs.directors}
			<OrganisationDirectorsPanel {directors} {members} canName={isStaff} />
		{/if}
	</div>
{/if}
