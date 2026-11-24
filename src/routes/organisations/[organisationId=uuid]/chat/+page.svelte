<script lang="ts">
	import ChatDecisionsTable from '$lib/components/chat/ChatDecisionsTable.svelte';
	import ChatRoomsPanel from '$lib/components/chat/ChatRoomsPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { chatHomeTabs, chatTitle, decisionsTab, roomsTab } from '$lib/components/chat/chatPageWords';
	import { openDecisionCount } from '$lib/data/chat/chatDecisionOrder';
	import { organisationCrumbsFor } from '$lib/components/organisations/organisationCrumbs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { chatOrganisation: organisation, listedRooms, parentChoices, decisions } = $derived(data);
	const tabs = $derived(chatHomeTabs(listedRooms.length, openDecisionCount(decisions)));
	let selectedTab = $state(roomsTab);
</script>

<svelte:head>
	<title>{chatTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={organisationCrumbsFor(organisation)} title={chatTitle}>
	<p class="text-sm text-chalk-subtle">
		The rooms {organisation.name}’s people talk in, each for one part of the business, with its subrooms beneath it.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<TabStrip {tabs} bind:selectedKey={selectedTab} />
	{#if selectedTab === roomsTab}
		<ChatRoomsPanel {organisation} {listedRooms} {parentChoices} />
	{/if}
	{#if selectedTab === decisionsTab}
		<ChatDecisionsTable {organisation} {decisions} />
	{/if}
</div>
