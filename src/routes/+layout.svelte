<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import PortalHeader from '$lib/components/portal/PortalHeader.svelte';
	import NavigationProgressBar from '$lib/components/site/NavigationProgressBar.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';
	import SiteHeader from '$lib/components/site/SiteHeader.svelte';
	import { SlowNavigation } from '$lib/client/slowNavigation.svelte';
	import { isPortalPage } from '$lib/portal/portalPaths';

	let { children, data } = $props();

	const slowNavigation = new SlowNavigation();
	const isPortal = $derived(isPortalPage(page.url));
</script>

<NavigationProgressBar />

<div class="flex min-h-screen flex-col">
	{#if isPortal}
		<PortalHeader isSignedIn={data.userEmail !== null} />
	{/if}
	{#if !isPortal}
		<SiteHeader
			userEmail={data.userEmail}
			isAdmin={data.isAdmin}
			isStaff={data.isStaff}
			hasOrganisations={data.hasOrganisations}
			unreadNotificationCount={data.unreadNotificationCount}
		/>
	{/if}
	<main
		class={[
			'flex-1 transition-opacity duration-300',
			slowNavigation.isActive && 'pointer-events-none opacity-40'
		]}
	>
		{@render children()}
	</main>
	<SiteFooter />
</div>
