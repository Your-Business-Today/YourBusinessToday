<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { confirmButtonClasses, fieldClasses } from '$lib/components/site/formStyles';
	import { portalRequestLimits } from '$lib/portal/portalRequest';

	const tracker = new FormTracker();
</script>

<DashboardPanel title="Raise a request">
	<form method="POST" action="?/raiseRequest" use:enhance={tracker.submit()} class="flex flex-col gap-4 p-4">
		<SmallCapsField label="What you need, in a sentence">
			<input name="title" required maxlength={portalRequestLimits.titleLength} class={fieldClasses} />
		</SmallCapsField>
		<SmallCapsField label="In your own words">
			<textarea name="want" required rows="4" maxlength={portalRequestLimits.wantLength} class={fieldClasses}
			></textarea>
		</SmallCapsField>
		<SmallCapsField label="Why it matters (optional)">
			<textarea name="benefit" rows="2" maxlength={portalRequestLimits.benefitLength} class={fieldClasses}></textarea>
		</SmallCapsField>
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton isSaving={tracker.isSaving} savingLabel="Raising…" class={`${confirmButtonClasses} self-start`}>Raise request</SubmitButton>
	</form>
</DashboardPanel>
