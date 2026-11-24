<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import ChatCatchUpPanel from '$lib/components/chat/ChatCatchUpPanel.svelte';
	import ChatDecisionsPanel from '$lib/components/chat/ChatDecisionsPanel.svelte';
	import ChatRoomList from '$lib/components/chat/ChatRoomList.svelte';
	import ChatRoomPanel from '$lib/components/chat/ChatRoomPanel.svelte';
	import ChatWhiteboardsControl from '$lib/components/chat/ChatWhiteboardsControl.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { chatHomePath } from '$lib/data/chat/chatPaths';
	import { moveDestinations } from '$lib/data/chat/chatMoveChoices';
	import { chatRoomViewGridClasses, chatTitle } from '$lib/components/chat/chatPageWords';
	import { organisationCrumbsFor } from '$lib/components/organisations/organisationCrumbs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { chatOrganisation: organisation, room, flow, listedRooms, catchUp, decisions, people, whiteboards } = $derived(data);
	const hasDecisions = $derived(decisions.length > 0);
	const destinations = $derived(moveDestinations(listedRooms, room.id));
	const chatCrumb = $derived({ label: chatTitle, href: chatHomePath(organisation.id) });
	const crumbs = $derived([...organisationCrumbsFor(organisation), chatCrumb]);
</script>

<svelte:head>
	<title>{room.name} — {chatTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader {crumbs} title={room.name}>
	{#snippet badge()}
		{#if room.isArchived}
			<Badge label="Archived" tone="notStarted" />
		{/if}
	{/snippet}
	{#snippet actions()}
		<ChatWhiteboardsControl organisationId={organisation.id} {room} {whiteboards} />
	{/snippet}
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class="lg:hidden">
		<Button href={chatHomePath(organisation.id)}>← All rooms</Button>
	</div>
	<div class={chatRoomViewGridClasses}>
		<div class="hidden lg:block">
			<DashboardPanel title="Rooms">
				<ChatRoomList organisationId={organisation.id} rooms={listedRooms} openRoomId={room.id} />
			</DashboardPanel>
		</div>
		{#key room.id}
			<div class="flex min-w-0 flex-col gap-4">
				<ChatCatchUpPanel {catchUp} />
				{#if hasDecisions}
					<ChatDecisionsPanel {decisions} />
				{/if}
				<ChatRoomPanel organisationId={organisation.id} {room} {flow} {destinations} {decisions} {people} />
			</div>
		{/key}
	</div>
</div>
