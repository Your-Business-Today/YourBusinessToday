<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import ChatWhiteboardEditor from '$lib/components/chat/ChatWhiteboardEditor.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { chatHomePath, chatRoomPath, chatWhiteboardPath } from '$lib/data/chat/chatPaths';
	import { chatTitle } from '$lib/components/chat/chatPageWords';
	import { organisationCrumbsFor } from '$lib/components/organisations/organisationCrumbs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { chatOrganisation: organisation, room, board } = $derived(data);
	const roomPath = $derived(chatRoomPath(organisation.id, room.id));
	const places = $derived({ roomPath, boardPath: chatWhiteboardPath(organisation.id, room.id, board.id) });
	const chatCrumb = $derived({ label: chatTitle, href: chatHomePath(organisation.id) });
	const crumbs = $derived([...organisationCrumbsFor(organisation), chatCrumb, { label: room.name, href: roomPath }]);
</script>

<svelte:head>
	<title>{board.title} — {room.name} — {chatTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader {crumbs} title={board.title}>
	{#snippet badge()}
		{#if room.isArchived}
			<Badge label="Archived room" tone="notStarted" />
		{/if}
	{/snippet}
	{#snippet actions()}
		<Button href={roomPath}>← Back to {room.name}</Button>
	{/snippet}
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#key board.id}
		<ChatWhiteboardEditor opened={board} {places} isArchived={room.isArchived} />
	{/key}
</div>
