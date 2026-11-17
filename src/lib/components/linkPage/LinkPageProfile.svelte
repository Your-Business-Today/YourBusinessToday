<script lang="ts">
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import { initialsOf } from '$lib/data/initialsOf';
	import type { LinkPage } from '$lib/data/linkPages/linkPage';

	let { linkPage }: { linkPage: LinkPage } = $props();

	const initials = $derived(initialsOf(linkPage.fullName));
</script>

<header class="flex flex-col items-center gap-4 text-center">
	{#if linkPage.photoPath}
		<img
			src={linkPage.photoPath}
			alt={linkPage.fullName}
			class="h-28 w-28 rounded-full border border-hairline-strong object-cover"
		/>
	{:else}
		<span
			class="flex h-28 w-28 items-center justify-center rounded-full border border-hairline-strong bg-carriage font-display text-4xl font-medium text-chalk"
			aria-hidden="true">{initials}</span
		>
	{/if}
	<div class="flex flex-col gap-1">
		<PageTitle>{linkPage.fullName}</PageTitle>
		<p class="text-sm text-signal">{linkPage.role}</p>
	</div>
	<p class="text-chalk-muted">{linkPage.introduction}</p>
</header>
