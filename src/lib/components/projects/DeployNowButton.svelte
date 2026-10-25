<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { stagingBranch } from '$lib/data/stagingBranch';

	let { defaultBranch }: { defaultBranch: string } = $props();

	const tracker = new FormTracker();
	const purpose = $derived(`Open the pull request from ${stagingBranch} into ${defaultBranch} now, merging itself at green`);
</script>

<form method="POST" action="?/deployNow" use:enhance={tracker.submit()} class="flex items-center gap-2">
	<button
		type="submit"
		disabled={tracker.isSaving}
		title={purpose}
		class={headerButtonClasses}
		class:animate-pulse={tracker.isSaving}
	>
		{tracker.isSaving ? 'Deploying…' : 'Deploy now'}
	</button>
	{#if tracker.errorMessage !== null}
		<p role="alert" class="text-xs text-caution">{tracker.errorMessage}</p>
	{/if}
</form>
