<script lang="ts">
	import AccountMenu from './AccountMenu.svelte';
	import BrandWordmark from './BrandWordmark.svelte';
	import MobileMenuButton from './MobileMenuButton.svelte';
	import MobileNavDrawer from './MobileNavDrawer.svelte';
	import NotificationsBell from './NotificationsBell.svelte';
	import SignInLink from './SignInLink.svelte';
	import { buildMenuGroups } from './siteNavigation';

	let {
		userEmail,
		isAdmin,
		isStaff,
		unreadNotificationCount
	}: {
		userEmail: string | null;
		isAdmin: boolean;
		isStaff: boolean;
		unreadNotificationCount: number;
	} = $props();

	const isSignedIn = $derived(userEmail !== null);
	const menuGroups = $derived(buildMenuGroups({ isSignedIn, isStaff: isStaff || isAdmin, isAdmin }));

	let isMobileMenuOpen = $state(false);

	const openMobileMenu = () => (isMobileMenuOpen = true);
	const closeMobileMenu = () => (isMobileMenuOpen = false);
</script>

<header
	class="relative z-40 h-[var(--site-header-height)] border-b border-hairline bg-night print:hidden"
>
	<div class="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
		<div class="flex min-w-0 items-center gap-3">
			<a href="/" class="flex shrink-0 items-center">
				<BrandWordmark fontSize={26} />
			</a>
		</div>
		<nav class="hidden shrink-0 items-center gap-6 md:flex">
			{#if isSignedIn}
				<NotificationsBell unreadCount={unreadNotificationCount} />
			{/if}
			{#if !isSignedIn}
				<SignInLink />
			{/if}
			<AccountMenu {menuGroups} />
		</nav>
		<div class="flex shrink-0 items-center gap-4 md:hidden">
			{#if isSignedIn}
				<NotificationsBell unreadCount={unreadNotificationCount} />
			{/if}
			<MobileMenuButton onOpen={openMobileMenu} />
		</div>
	</div>
</header>

{#if isMobileMenuOpen}
	<MobileNavDrawer {menuGroups} {isSignedIn} onClose={closeMobileMenu} />
{/if}
