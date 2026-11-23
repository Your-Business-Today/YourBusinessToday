<script lang="ts">
	import ChatRoomsPanel from '$lib/components/chat/ChatRoomsPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { chatTitle } from '$lib/components/chat/chatPageWords';
	import { organisationCrumbsFor } from '$lib/components/organisations/organisationCrumbs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { chatOrganisation: organisation, listedRooms, parentChoices } = $derived(data);
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
	<ChatRoomsPanel {organisation} {listedRooms} {parentChoices} />
</div>
