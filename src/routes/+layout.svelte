<script lang="ts">
	import '../app.css';
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import NavigationSpinner from '$lib/components/site/NavigationSpinner.svelte';
	import PortalFrame from '$lib/components/frame/PortalFrame.svelte';
	import PortalHeader from '$lib/components/portal/PortalHeader.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';
	import SiteHeader from '$lib/components/site/SiteHeader.svelte';
	import { viewEntrance } from '$lib/client/motion';
	import { viewKeyOf } from '$lib/client/viewTransition';
	import { isFramedPage } from '$lib/components/frame/framedPaths';
	import { isPortalPage } from '$lib/portal/portalPaths';

	let { children, data } = $props();

	const isSignedIn = $derived(data.userEmail !== null);
	const isFramed = $derived(isSignedIn && isFramedPage(page.url));
	const isPortal = $derived(isPortalPage(page.url));
	const viewKey = $derived(viewKeyOf(page.route, page.params));
</script>

<NavigationSpinner />

{#snippet pageView()}
	{#key viewKey}
		<div in:fly={viewEntrance} class="flex flex-1 flex-col">
			{@render children()}
		</div>
	{/key}
{/snippet}

{#if isFramed}
	<PortalFrame
		access={data}
		signedInAs={data.userEmail ?? data.personName}
		unreadNotificationCount={data.unreadNotificationCount}
		picks={data.framePicks}
	>
		{@render pageView()}
	</PortalFrame>
{/if}

{#if !isFramed}
	<div class="flex min-h-screen flex-col">
		{#if isPortal}
			<PortalHeader {isSignedIn} />
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
		<main class="flex flex-1 flex-col">{@render pageView()}</main>
		<SiteFooter />
	</div>
{/if}
