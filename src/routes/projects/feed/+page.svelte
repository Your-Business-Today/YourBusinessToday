<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FeedDaySection from '$lib/components/feed/FeedDaySection.svelte';
	import FeedPageHeader from '$lib/components/feed/FeedPageHeader.svelte';
	import FeedScoreboard from '$lib/components/feed/FeedScoreboard.svelte';
	import { LiveRefresh } from '$lib/client/liveRefresh.svelte';
	import { feedScopes } from '$lib/data/feedEvent';
	import { groupFeedByDay } from '$lib/data/feedDays';
	import { scoreFeedToday } from '$lib/data/feedScore';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { feedDependency } from '$lib/data/feedRefresh';

	let { data } = $props();

	const liveRefresh = new LiveRefresh(feedDependency);

	const days = $derived(groupFeedByDay(data.events));
	const score = $derived(scoreFeedToday(data.events));
	const isMine = $derived(data.scope === feedScopes.mine);

	const emptyMessages = {
		everything: 'Nothing has happened on your projects yet — the first task raised, started or done shows here.',
		mine: 'No task you asked for has moved yet — when one is started or done it shows here.'
	};
</script>

<svelte:head>
	<title>Feed — Your Business Today</title>
</svelte:head>

<FeedPageHeader scope={data.scope} readAt={data.readAt} isRefreshing={liveRefresh.isRefreshing} />

<div class={workspaceBodyClasses}>
	<FeedScoreboard {score} />
	{#if days.length === 0}
		<EmptyState message={isMine ? emptyMessages.mine : emptyMessages.everything} />
	{:else}
		{#each days as day (day.dayKey)}
			<FeedDaySection {day} viewerId={data.viewerId} />
		{/each}
	{/if}
</div>
