<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { clientSetUpLimits, setUpFormFields } from '$lib/onboarding/onboarding';
	import { inputClasses } from '$lib/components/site/formStyles';
	import type { ClientPerson } from '$lib/server/clients/getPeopleForClient';

	let { people }: { people: ClientPerson[] } = $props();

	const reachablePeople = $derived(people.filter((person) => person.email !== ''));
</script>

<form method="POST" action="?/setUpClient" class="flex flex-col gap-4">
	<p class="text-sm text-chalk/70">
		Makes the client’s organisation and its Onboarding project, once, and sends each person one
		email. Their link signs them in and lands them on their company on the portal, with the steps to
		connect their Claude and the one prompt. The first person ticked manages the organisation.
	</p>
	{#each reachablePeople as person (person.contactId)}
		<label class="flex items-center gap-2 text-sm text-chalk/70">
			<input
				type="checkbox"
				name={setUpFormFields.chosenContact}
				value={person.contactId}
				checked={person.isPrimary}
				class="accent-go"
			/>
			{person.name} · {person.email}
		</label>
	{/each}
	<FormField label="Someone not listed yet: name">
		<input
			name={setUpFormFields.newPersonName}
			maxlength={clientSetUpLimits.nameLength}
			class={inputClasses}
		/>
	</FormField>
	<FormField label="Their email">
		<input
			name={setUpFormFields.newPersonEmail}
			type="email"
			maxlength={clientSetUpLimits.emailLength}
			class={inputClasses}
		/>
	</FormField>
	<SubmitButton savingLabel="Setting up…">Set up and send the links</SubmitButton>
</form>
