<script lang="ts">
	import MobileMenuButton from '$lib/components/site/MobileMenuButton.svelte';
	import NotificationsBell from '$lib/components/site/NotificationsBell.svelte';

	let {
		heading,
		unreadNotificationCount,
		onOpenMenu
	}: { heading: string; unreadNotificationCount: number; onOpenMenu: () => void } = $props();
</script>

<header
	class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-hairline bg-night/80 px-4
		backdrop-blur print:hidden"
>
	<div class="flex md:hidden">
		<MobileMenuButton onOpen={onOpenMenu} />
	</div>
	<p class="min-w-0 flex-1 truncate font-display text-xl font-medium text-chalk">{heading}</p>
	<NotificationsBell unreadCount={unreadNotificationCount} />
</header>
