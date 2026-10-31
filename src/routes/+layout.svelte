<script lang="ts">
	import '../app.css';
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import NavigationSpinner from '$lib/components/site/NavigationSpinner.svelte';
	import PortalHeader from '$lib/components/portal/PortalHeader.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';
	import SiteHeader from '$lib/components/site/SiteHeader.svelte';
	import { viewEntrance, viewKeyOf } from '$lib/client/viewTransition';
	import { isPortalPage } from '$lib/portal/portalPaths';

	let { children, data } = $props();

	const isPortal = $derived(isPortalPage(page.url));
	const viewKey = $derived(viewKeyOf(page.route, page.params));
</script>

<NavigationSpinner />

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
	<main class="flex flex-1 flex-col">
		{#key viewKey}
			<div in:fly={viewEntrance} class="flex flex-1 flex-col">
				{@render children()}
			</div>
		{/key}
	</main>
	<SiteFooter />
</div>
