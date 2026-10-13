<script lang="ts">
	import BrandWordmark from '$lib/components/site/BrandWordmark.svelte';
	import SignInLink from '$lib/components/site/SignInLink.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';

	let { isSignedIn }: { isSignedIn: boolean } = $props();
</script>

<header
	class="relative z-40 h-[var(--site-header-height)] border-b border-hairline bg-night print:hidden"
>
	<div class="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
		<a href="/" class="flex min-w-0 items-center gap-3">
			<BrandWordmark fontSize={26} />
			<span class="truncate font-display text-xs tracking-widest text-chalk/60 uppercase">
				Client portal
			</span>
		</a>
		{#if isSignedIn}
			<form method="POST" action="/?/signOut">
				<SubmitButton class={headerButtonClasses}>Sign out</SubmitButton>
			</form>
		{/if}
		{#if !isSignedIn}
			<SignInLink />
		{/if}
	</div>
</header>
