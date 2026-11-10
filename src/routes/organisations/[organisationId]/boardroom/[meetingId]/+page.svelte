<script lang="ts">
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import MeetingStageBadge from '$lib/components/boardroom/MeetingStageBadge.svelte';
	import MeetingAgendaPanel from '$lib/components/boardroom/MeetingAgendaPanel.svelte';
	import MeetingFactsPanel from '$lib/components/boardroom/MeetingFactsPanel.svelte';
	import { boardroomCrumbsOf } from '$lib/components/boardroom/boardroomCrumbs';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { organisation, meeting } = $derived(data);
	const title = $derived(`Board meeting, ${meeting.when}`);
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
	<div class={dashboardGridClasses}>
		<MeetingAgendaPanel agenda={meeting.agenda} withdrawnTitles={meeting.withdrawnTitles} />
		<aside class="flex min-w-0 flex-col gap-4">
			<MeetingFactsPanel {meeting} />
		</aside>
	</div>
</div>
