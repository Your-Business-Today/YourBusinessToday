<script lang="ts">
	import '../app.css';
	import NavigationProgressBar from '$lib/components/site/NavigationProgressBar.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';
	import SiteHeader from '$lib/components/site/SiteHeader.svelte';
	import { SlowNavigation } from '$lib/client/slowNavigation.svelte';

	let { children, data } = $props();

	const slowNavigation = new SlowNavigation();
</script>

<NavigationProgressBar />

<div class="flex min-h-screen flex-col">
	<SiteHeader
		userEmail={data.userEmail}
		isAdmin={data.isAdmin}
		isStaff={data.isStaff}
		hasOrganisations={data.hasOrganisations}
		unreadNotificationCount={data.unreadNotificationCount}
	/>
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
