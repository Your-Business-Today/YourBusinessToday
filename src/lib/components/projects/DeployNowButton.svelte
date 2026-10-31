<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { menuItemClasses } from '$lib/components/site/ActionsMenu.svelte';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { stagingBranch } from '$lib/data/stagingBranch';

	let { defaultBranch, isMenuItem = false }: { defaultBranch: string; isMenuItem?: boolean } = $props();

	const tracker = new FormTracker();
	const purpose = $derived(`Open the pull request from ${stagingBranch} into ${defaultBranch} now, merging itself at green`);
	const formClasses = $derived(isMenuItem ? 'flex flex-col gap-1' : 'flex items-center gap-2');
	const buttonClasses = $derived(isMenuItem ? menuItemClasses : headerButtonClasses);
</script>

<form method="POST" action="?/deployNow" use:enhance={tracker.submit()} class={formClasses}>
	<button
		type="submit"
		role={isMenuItem ? 'menuitem' : undefined}
		disabled={tracker.isSaving}
		title={purpose}
		class={buttonClasses}
		class:animate-pulse={tracker.isSaving}
	>
		{tracker.isSaving ? 'Deploying…' : 'Deploy now'}
	</button>
	{#if tracker.errorMessage !== null}
		<p role="alert" class="px-3 text-xs text-caution">{tracker.errorMessage}</p>
	{/if}
</form>
