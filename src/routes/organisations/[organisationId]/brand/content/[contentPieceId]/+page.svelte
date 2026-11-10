<script lang="ts">
	import ContentPieceText from '$lib/components/brand/ContentPieceText.svelte';
	import ContentPostChannelTable from '$lib/components/brand/ContentPostChannelTable.svelte';
	import ContentReviewPanel from '$lib/components/brand/ContentReviewPanel.svelte';
	import ContentReviewList from '$lib/components/brand/ContentReviewList.svelte';
	import ContentStageBadge from '$lib/components/brand/ContentStageBadge.svelte';
	import ContentStoryboardTable from '$lib/components/brand/ContentStoryboardTable.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { brandCrumbsFor } from '$lib/components/brand/brandKitPageWords';
	import { channelsExplained, channelsPanelTitle } from '$lib/components/brand/contentPostWords';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { formatBritishDateTime, formatUkDateTime } from '$lib/data/britishDate';

	let { data, form } = $props();

	const { brandOrganisation: organisation, piece } = $derived(data);
	const answer = $derived(form?.message ?? null);
</script>

<svelte:head>
	<title>{piece.title} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={brandCrumbsFor(organisation)} title={piece.title}>
	{#snippet badge()}<ContentStageBadge stage={piece.stage} />{/snippet}
	<p class="text-sm text-chalk-muted">For {piece.medium}.</p>
	{#if piece.scheduledFor !== null}
		<p class="text-sm text-chalk-muted">Goes out {formatBritishDateTime(piece.scheduledFor)}.</p>
	{:else if piece.plannedFor !== null}
		<p class="text-sm text-chalk-muted">Planned for {formatUkDateTime(piece.plannedFor)}.</p>
	{/if}
	{#if piece.publishedUrl !== ''}
		<a href={piece.publishedUrl} rel="noopener noreferrer" target="_blank" class="text-sm text-go hover:underline">Where it went out</a>
	{/if}
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-6">
			<DashboardPanel title="The piece" isPadded>
				<ContentPieceText {piece} />
			</DashboardPanel>
			<DashboardPanel title={channelsPanelTitle} count={piece.channels.length}>
				<p class="px-6 pt-4 text-sm text-chalk-muted">{channelsExplained}</p>
				<ContentPostChannelTable organisationId={organisation.id} channels={piece.channels} />
			</DashboardPanel>
			<DashboardPanel title="Storyboard">
				<ContentStoryboardTable shots={piece.shots} />
			</DashboardPanel>
		</div>
		<aside class="flex min-w-0 flex-col gap-6">
			<ContentReviewPanel stage={piece.stage} isAwaitingApproval={piece.isAwaitingApproval} {answer} />
			<DashboardPanel title="Reviews" isPadded>
				<ContentReviewList reviews={piece.reviews} />
			</DashboardPanel>
		</aside>
	</div>
</div>
