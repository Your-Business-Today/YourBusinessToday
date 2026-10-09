<script lang="ts">
	import FeedScopeChips from './FeedScopeChips.svelte';
	import LiveMarker from './LiveMarker.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { projectsCrumb } from '$lib/components/workspace/projectCrumbs';
	import type { FeedScope } from '$lib/data/feedEvent';

	let {
		scope,
		readAt,
		isRefreshing
	}: { scope: FeedScope; readAt: string; isRefreshing: boolean } = $props();
</script>

<WorkspaceHeader crumbs={[projectsCrumb]} title="Feed">
	{#snippet badge()}
		<LiveMarker {readAt} {isRefreshing} />
	{/snippet}
	{#snippet actions()}
		<a href="/projects" class={headerButtonClasses}>Project view</a>
		<a href="/tasks" class={headerButtonClasses}>Task view</a>
	{/snippet}
	<p class="text-sm text-chalk/60">
		Every move on your projects as it happens — a task raised, started, sent for review, done — newest first.
	</p>
	<FeedScopeChips {scope} />
</WorkspaceHeader>
