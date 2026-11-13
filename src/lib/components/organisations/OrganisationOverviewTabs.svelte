<script lang="ts">
	import OrganisationBillingPanel from './billing/OrganisationBillingPanel.svelte';
	import OrganisationDetailsPanel from './OrganisationDetailsPanel.svelte';
	import OrganisationDirectorsPanel from './OrganisationDirectorsPanel.svelte';
	import OrganisationModulesPanel from './OrganisationModulesPanel.svelte';
	import OrganisationPeoplePanel from './OrganisationPeoplePanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { organisationOverviewTabs, organisationOverviewTabsFor } from './organisationOverviewTabs';
	import type { BoardroomDirector } from '$lib/data/boardroomDirector';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';
	import type { OrganisationModule } from '$lib/data/organisationModules';
	import { billingScheduleCountOf, type OrganisationBilling } from '$lib/data/books/organisationBilling';

	let {
		organisation,
		members,
		modules,
		directors,
		billing,
		canManage,
		isStaff
	}: {
		organisation: Organisation;
		members: OrganisationMember[];
		modules: OrganisationModule[];
		directors: BoardroomDirector[];
		billing: OrganisationBilling | null;
		canManage: boolean;
		isStaff: boolean;
	} = $props();

	let selectedTab = $state<string>(organisationOverviewTabs.people);

	const hasBoardroom = $derived(modules.includes('boardroom'));
	const tabs = $derived(
		organisationOverviewTabsFor({
			memberCount: members.length,
			switchedOnModuleCount: modules.length,
			hasModulesTab: isStaff || modules.length > 0,
			directorCount: hasBoardroom ? directors.length : null,
			billingScheduleCount: billingScheduleCountOf(billing)
		})
	);
	const shownTab = $derived(tabs.some((tab) => tab.key === selectedTab) ? selectedTab : organisationOverviewTabs.people);
</script>

<nav aria-label={`${organisation.name} overview`}>
	<TabStrip {tabs} bind:selectedKey={selectedTab} />
</nav>

{#if shownTab === organisationOverviewTabs.people}
	<OrganisationPeoplePanel {organisation} {members} {canManage} />
{:else if shownTab === organisationOverviewTabs.details}
	<OrganisationDetailsPanel {organisation} {canManage} />
{:else if shownTab === organisationOverviewTabs.modules}
	<OrganisationModulesPanel {modules} canSwitch={isStaff} />
{:else if shownTab === organisationOverviewTabs.directors}
	<OrganisationDirectorsPanel {directors} {members} canName={isStaff} />
{:else if shownTab === organisationOverviewTabs.billing && billing !== null}
	<OrganisationBillingPanel {billing} />
{/if}
