<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';

	let { databaseTaskId }: { databaseTaskId: string } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/confirmRun" use:enhance={tracker.submit()}>
	<input type="hidden" name="databaseTaskId" value={databaseTaskId} />
	<button type="submit" disabled={tracker.isSaving} class={panelButtonClasses}>
		{tracker.isSaving ? 'Confirming…' : 'Confirm run'}
	</button>
</form>
