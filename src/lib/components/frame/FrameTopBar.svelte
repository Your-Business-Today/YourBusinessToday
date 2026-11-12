<script lang="ts">
	import MobileMenuButton from '$lib/components/site/MobileMenuButton.svelte';
	import NotificationsBell from '$lib/components/site/NotificationsBell.svelte';
	import FrameMenu from './FrameMenu.svelte';
	import type { FrameView } from './frameView';
	import type { Snippet } from 'svelte';

	let {
		view,
		signedInAs,
		unreadNotificationCount,
		onOpenMenu,
		children
	}: {
		view: FrameView;
		signedInAs: string;
		unreadNotificationCount: number;
		onOpenMenu: () => void;
		children?: Snippet;
	} = $props();

	const { trail } = $derived(view);
</script>

<header
	class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-hairline bg-night/80 px-4
		backdrop-blur sm:px-6 print:hidden"
>
	<div class="flex md:hidden">
		<MobileMenuButton onOpen={onOpenMenu} />
	</div>
	<nav aria-label="Where you are" class="flex min-w-0 flex-1 items-center gap-2 font-display text-sm">
		{#each trail.crumbs as crumb (crumb.href)}
			<a href={crumb.href} class="hidden max-w-56 truncate text-chalk-faint transition hover:text-chalk sm:block">
				{crumb.label}
			</a>
			<span aria-hidden="true" class="hidden text-hairline-strong sm:block">/</span>
		{/each}
		{#if trail.heading !== null}
			<p aria-current="page" class="truncate font-medium text-chalk">{trail.heading}</p>
		{/if}
		{@render children?.()}
	</nav>
	<NotificationsBell unreadCount={unreadNotificationCount} />
	<FrameMenu links={view.menuLinks} {signedInAs} signOutPath={view.signOutPath} />
</header>
