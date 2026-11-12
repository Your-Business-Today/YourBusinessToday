<script lang="ts">
	import AccountMenu from '$lib/components/site/AccountMenu.svelte';
	import type { NavigationLink } from '$lib/components/site/siteNavigation';

	let {
		links,
		signedInAs,
		signOutPath
	}: { links: NavigationLink[]; signedInAs: string; signOutPath: string } = $props();

	const menuGroups = $derived([{ label: 'Above the organisation', links }]);
</script>

<AccountMenu {menuGroups}>
	{#snippet heading()}
		<p class="mb-2 border-b border-hairline px-3 pt-1 pb-3 text-xs break-all text-chalk-subtle">{signedInAs}</p>
	{/snippet}
	<form method="POST" action={signOutPath} class="mt-2 border-t border-hairline pt-2">
		<button
			type="submit"
			class="block w-full rounded-lg px-3 py-2 text-left font-display text-sm text-chalk/80 transition
				hover:bg-night/60 hover:text-chalk"
		>
			Sign out
		</button>
	</form>
</AccountMenu>
