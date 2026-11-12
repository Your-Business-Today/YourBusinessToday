<script lang="ts">
	import AccountMenu from './AccountMenu.svelte';
	import BrandWordmark from './BrandWordmark.svelte';
	import DiscoveryCallButton from './DiscoveryCallButton.svelte';
	import MobileMenuButton from './MobileMenuButton.svelte';
	import MobileNavDrawer from './MobileNavDrawer.svelte';
	import PortalLink from './PortalLink.svelte';
	import { siteMenuGroups } from './siteNavigation';
	import { discoveryCallShortLabel } from '$lib/data/discoveryCall';

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
			<PortalLink />
			<DiscoveryCallButton isSolid label={discoveryCallShortLabel} class="px-4 py-2 text-sm" />
			<AccountMenu menuGroups={siteMenuGroups} />
		</nav>
		<div class="flex shrink-0 items-center gap-4 md:hidden">
			<MobileMenuButton onOpen={openMobileMenu} />
		</div>
	</div>
</header>

{#if isMobileMenuOpen}
	<MobileNavDrawer menuGroups={siteMenuGroups} onClose={closeMobileMenu} />
{/if}
