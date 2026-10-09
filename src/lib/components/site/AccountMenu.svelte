<script lang="ts">
	import AccountMenuGroup from './AccountMenuGroup.svelte';
	import type { NavigationGroup } from './siteNavigation';
	import { keyboardKeys } from '$lib/client/keyboardKeys';

	let { menuGroups }: { menuGroups: NavigationGroup[] } = $props();

	let isOpen = $state(false);

	const toggleMenu = () => (isOpen = !isOpen);
	const closeMenu = () => (isOpen = false);

	/** Escape closes the open menu and claims the key, so the page beneath does not act on it too. */
	function closeOnEscape(event: KeyboardEvent): void {
		if (!isOpen || event.key !== keyboardKeys.escape) return;
		event.preventDefault();
		closeMenu();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

<div class="relative">
	<button
		type="button"
		aria-label="Open menu"
		aria-expanded={isOpen}
		class="text-chalk/80 transition hover:text-chalk"
		onclick={toggleMenu}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-6 w-6"
			aria-hidden="true"
		>
			<path d="M4 6h16" />
			<path d="M4 12h16" />
			<path d="M4 18h16" />
		</svg>
	</button>
	{#if isOpen}
		<button
			type="button"
			aria-label="Close menu"
			class="fixed inset-0 z-40 cursor-default"
			onclick={closeMenu}
		></button>
		<nav
			aria-label="Account menu"
			class="absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-hairline bg-carriage p-2
				shadow-2xl"
		>
			{#each menuGroups as menuGroup, groupIndex (menuGroup.label)}
				<AccountMenuGroup {menuGroup} isFirst={groupIndex === 0} onNavigate={closeMenu} />
			{/each}
		</nav>
	{/if}
</div>
