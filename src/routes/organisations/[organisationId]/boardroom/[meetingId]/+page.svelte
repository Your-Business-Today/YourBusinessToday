<script lang="ts">
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import MeetingStageBadge from '$lib/components/boardroom/MeetingStageBadge.svelte';
	import MeetingAgendaPanel from '$lib/components/boardroom/MeetingAgendaPanel.svelte';
	import MeetingFactsPanel from '$lib/components/boardroom/MeetingFactsPanel.svelte';
	import OwnClaudePanel from '$lib/components/boardroom/OwnClaudePanel.svelte';
	import MeetingClosePanel from '$lib/components/boardroom/MeetingClosePanel.svelte';
	import MeetingMinutesPanel from '$lib/components/boardroom/MeetingMinutesPanel.svelte';
	import { LiveRefresh } from '$lib/client/liveRefresh.svelte';
	import { boardMeetingDependency, boardMeetingRefreshMilliseconds } from '$lib/data/boardSeatControlForm';
	import { boardroomCrumbsOf } from '$lib/components/boardroom/boardroomCrumbs';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const liveRefresh = new LiveRefresh(boardMeetingDependency, boardMeetingRefreshMilliseconds);

	const { organisation, meeting, close, minutes } = $derived(data);
	const title = $derived(`Board meeting, ${meeting.when}`);
	const followingWords = $derived(liveRefresh.isRefreshing ? 'Catching up with the room…' : 'Following the meeting as it happens.');
</script>

<svelte:head>
	<title>{title} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={boardroomCrumbsOf(organisation)} {title}>
	{#snippet badge()}
		<MeetingStageBadge stage={meeting.stage} />
	{/snippet}
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<p class="text-xs text-chalk-subtle" aria-live="polite">{followingWords}</p>
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-4">
			{#if minutes.isClosed}
				<MeetingMinutesPanel {minutes} />
			{/if}
			<MeetingAgendaPanel agenda={meeting.agenda} withdrawnTitles={meeting.withdrawnTitles} />
		</div>
		<aside class="order-first flex min-w-0 flex-col gap-4 lg:order-none">
			{#if close.canClose}
				<MeetingClosePanel {close} />
			{/if}
			{#if meeting.ownClaude !== null}
				<OwnClaudePanel ownClaude={meeting.ownClaude} />
			{/if}
			<MeetingFactsPanel {meeting} />
		</aside>
	</div>
</div>
