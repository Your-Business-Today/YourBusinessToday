<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { confirmButtonClasses } from '$lib/components/site/formStyles';
	import { mapConfirmInvitation } from '$lib/data/workflowMap/mapConfirmed';
	import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

	let { map }: { map: WorkflowMapVersion } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/confirmMap" use:enhance={tracker.submit()} class="flex flex-col gap-3">
	<input type="hidden" name="stage" value={map.stage} />
	<input type="hidden" name="versionNumber" value={map.versionNumber} />
	<p class="text-chalk/80">{mapConfirmInvitation(map.stage, map.versionNumber)}</p>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} class={`${confirmButtonClasses} self-start`}>Confirm it is right</SubmitButton>
</form>
