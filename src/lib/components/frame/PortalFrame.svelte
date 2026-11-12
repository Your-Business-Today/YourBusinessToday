<script lang="ts">
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import FrameDrawer from './FrameDrawer.svelte';
	import FrameSideBar from './FrameSideBar.svelte';
	import FrameTopBar from './FrameTopBar.svelte';
	import ProjectSwitcher from '$lib/components/projects/ProjectSwitcher.svelte';
	import { frameViewFor } from './frameView';
	import { isFrameDrawerOpen, withFrameDrawerOpen } from './frameDrawerState';
	import { openProjectOn } from '$lib/components/projects/projectPages';
	import type { FrameAccess } from './frameNavigation';
	import type { FramePicks } from './framePicks';
	import type { Snippet } from 'svelte';

	let {
		access,
		signedInAs,
		unreadNotificationCount,
		picks,
		children
	}: {
		access: FrameAccess;
		signedInAs: string;
		unreadNotificationCount: number;
		picks: FramePicks | null;
		children: Snippet;
	} = $props();

	const { route, data, url } = $derived(page);
	const openProject = $derived(openProjectOn(route.id, data));
	const view = $derived(frameViewFor(access, url, picks, openProject));
	const isDrawerOpen = $derived(isFrameDrawerOpen(page.state));

	const openDrawer = () => pushState('', withFrameDrawerOpen(page.state));
	const closeDrawer = () => history.back();
</script>

{#snippet sideBar()}
	<FrameSideBar {view} {signedInAs} {picks} />
{/snippet}

<aside
	class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-hairline bg-carriage md:block
		print:hidden"
>
	{@render sideBar()}
</aside>

{#if isDrawerOpen}
	<FrameDrawer onClose={closeDrawer}>{@render sideBar()}</FrameDrawer>
{/if}

<div class="flex min-h-screen flex-col md:pl-64 print:pl-0">
	<FrameTopBar {view} {signedInAs} {unreadNotificationCount} onOpenMenu={openDrawer}>
		{#if openProject !== null}
			<ProjectSwitcher project={openProject} projects={picks?.projects ?? []} address={url} />
		{/if}
	</FrameTopBar>
	<main class="flex flex-1 flex-col">{@render children()}</main>
</div>
