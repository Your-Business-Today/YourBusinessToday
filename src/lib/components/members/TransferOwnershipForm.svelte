<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { members, onTransferred }: { members: ProjectPerson[]; onTransferred: () => void } =
		$props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/transferOwnership"
	use:enhance={tracker.submit(onTransferred)}
	class="flex flex-col gap-4"
>
	<SmallCapsField label="New owner">
		<select
			name="accountId"
			required
			class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
				focus:border-go"
		>
			<option value="">Choose someone on the project</option>
			{#each members as member (member.id)}
				<option value={member.id}>{member.name}</option>
			{/each}
		</select>
	</SmallCapsField>
	<p class="text-xs text-chalk/50">
		They take over managing the project — its details, its people, and deleting it. You stay on
		it as a member and keep working its goals and tasks.
	</p>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Transferring…"
		class="self-end rounded-full bg-caution px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Transfer ownership
	</SubmitButton>
</form>
