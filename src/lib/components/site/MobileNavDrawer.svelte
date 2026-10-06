<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import MobileNavGroup from './MobileNavGroup.svelte';
	import type { NavigationGroup } from './siteNavigation';
	import { keyboardKeys } from '$lib/client/keyboardKeys';

	let {
		menuGroups,
		isSignedIn,
		onClose
	}: {
		menuGroups: NavigationGroup[];
		isSignedIn: boolean;
		onClose: () => void;
	} = $props();

	const drawerWidth = 256;

	function closeOnEscape(event: KeyboardEvent): void {
		if (event.key !== keyboardKeys.escape) return;
		event.preventDefault();
		onClose();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

<button
	type="button"
	aria-label="Close menu"
	class="fixed inset-0 z-40 bg-night/70 md:hidden"
	transition:fade={{ duration: 150 }}
	onclick={onClose}
></button>

<nav
	aria-label="Site menu"
	class="fixed inset-y-0 right-0 z-50 flex w-64 flex-col gap-1 overflow-y-auto border-l
		border-hairline bg-carriage px-4 py-4 md:hidden"
	transition:fly={{ x: drawerWidth, duration: 200, opacity: 1 }}
>
	<div class="mb-2 flex justify-end">
		<button
			type="button"
			aria-label="Close menu"
			class="p-1 text-chalk/80 transition hover:text-chalk"
			onclick={onClose}
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
				<path d="M18 6 6 18" />
				<path d="m6 6 12 12" />
			</svg>
		</button>
	</div>
	{#each menuGroups as menuGroup (menuGroup.label)}
		<MobileNavGroup group={menuGroup} onNavigate={onClose} />
	{/each}
</nav>
