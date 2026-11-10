<script lang="ts">
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import FrameDrawer from './FrameDrawer.svelte';
	import FrameSideBar from './FrameSideBar.svelte';
	import FrameTopBar from './FrameTopBar.svelte';
	import { frameViewFor } from './frameView';
	import { isFrameDrawerOpen, withFrameDrawerOpen } from './frameDrawerState';
	import type { FrameAccess } from './frameNavigation';
	import type { FramePicks } from './framePicks';
	import type { Snippet } from 'svelte';

	let {
		access,
		personName,
		unreadNotificationCount,
		picks,
		children
	}: {
		access: FrameAccess;
		personName: string;
		unreadNotificationCount: number;
		picks: FramePicks | null;
		children: Snippet;
	} = $props();

	const view = $derived(frameViewFor(access, page.url, picks));
	const isDrawerOpen = $derived(isFrameDrawerOpen(page.state));

	const openDrawer = () => pushState('', withFrameDrawerOpen(page.state));
	const closeDrawer = () => history.back();
</script>

{#snippet sideBar()}
	<FrameSideBar {view} {personName} {picks} />
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
	<FrameTopBar heading={view.heading} {unreadNotificationCount} onOpenMenu={openDrawer} />
	<main class="flex flex-1 flex-col">{@render children()}</main>
</div>
