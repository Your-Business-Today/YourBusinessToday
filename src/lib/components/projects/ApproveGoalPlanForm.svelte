<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { requestedApproveButtonClasses } from './requestedStyles';

	let { goalId, label }: { goalId: string; label: string } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/approveGoalRequests" use:enhance={tracker.submit()} class="flex items-center gap-2">
	<input type="hidden" name="goalId" value={goalId} />
	<button type="submit" disabled={tracker.isSaving} class={requestedApproveButtonClasses}>{label}</button>
	{#if tracker.errorMessage}
		<p class="text-xs text-caution" role="alert">{tracker.errorMessage}</p>
	{/if}
</form>
