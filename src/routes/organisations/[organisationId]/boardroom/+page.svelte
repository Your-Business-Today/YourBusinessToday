<script lang="ts">
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import BoardMeetingsTable from '$lib/components/boardroom/BoardMeetingsTable.svelte';
	import CallMeetingPanel from '$lib/components/boardroom/CallMeetingPanel.svelte';
	import { organisationCrumbOf } from '$lib/components/boardroom/boardroomCrumbs';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { organisation, meetings } = $derived(data);
</script>

<svelte:head>
	<title>Boardroom — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[organisationCrumbOf(organisation)]} title="Boardroom">
	<p class="text-sm text-chalk-muted">
		The board meetings of {organisation.name}. Each director's own Claude speaks for them in the room.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<DashboardPanel title="Meetings" count={meetings.length}>
			<BoardMeetingsTable organisationId={organisation.id} {meetings} />
		</DashboardPanel>
		<aside class="flex min-w-0 flex-col gap-4">
			<CallMeetingPanel chairChoices={data.chairChoices} today={data.today} titleMaximumLength={data.titleMaximumLength} />
		</aside>
	</div>
</div>
