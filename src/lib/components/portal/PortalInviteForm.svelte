<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { confirmButtonClasses, fieldClasses } from '$lib/components/site/formStyles';
	import { portalPersonLimits } from '$lib/portal/portalPerson';

	const tracker = new FormTracker();
</script>

<DashboardPanel title="Invite someone">
	<form method="POST" action="?/invitePerson" use:enhance={tracker.submit()} class="flex flex-col gap-4 p-4">
		<SmallCapsField label="Name">
			<input name="name" required maxlength={portalPersonLimits.nameLength} class={fieldClasses} />
		</SmallCapsField>
		<SmallCapsField label="Email address">
			<input name="email" type="email" required maxlength={portalPersonLimits.emailLength} class={fieldClasses} />
		</SmallCapsField>
		<SmallCapsField label="Role (optional)">
			<input name="role" maxlength={portalPersonLimits.roleLength} class={fieldClasses} />
		</SmallCapsField>
		<label class="flex items-center gap-2 text-sm text-chalk/80">
			<input name="isAdministrator" type="checkbox" />
			Make them an administrator too
		</label>
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton isSaving={tracker.isSaving} savingLabel="Inviting…" class={`${confirmButtonClasses} self-start`}>
			Send invitation
		</SubmitButton>
	</form>
</DashboardPanel>
