<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import {
		longestAccountsContactEmail,
		longestAccountsContactName,
		longestAccountsContactPhone,
		longestOrganisationAddress,
		longestOrganisationName,
		type OrganisationDetails
	} from '$lib/data/organisationRules';
	import { organisationLabelClasses } from './organisationFormStyles';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import FormField from '$lib/components/site/FormField.svelte';

	let { details, namePlaceholder }: { details: OrganisationDetails; namePlaceholder: string } = $props();

	const contact = $derived(details.accountsContact);
</script>

<SmallCapsField label="Name">
	<input
		name="name"
		required
		value={details.name}
		placeholder={namePlaceholder}
		maxlength={longestOrganisationName}
		class={fieldClasses}
	/>
</SmallCapsField>
<SmallCapsField label="Address">
	<textarea
		name="address"
		rows="3"
		placeholder="As it goes on an invoice"
		maxlength={longestOrganisationAddress}
		class={fieldClasses}>{details.address}</textarea
	>
</SmallCapsField>
<fieldset class="flex flex-col gap-3 rounded-xl border border-hairline p-4">
	<legend class={`px-1 ${organisationLabelClasses}`}>Accounts contact</legend>
	<FormField label="Name">
		<input
			name="accountsContactName"
			value={contact.name}
			maxlength={longestAccountsContactName}
			class={fieldClasses}
		/>
	</FormField>
	<div class="flex flex-wrap gap-3">
		<FormField label="Email" class="min-w-48 flex-1">
			<input
				name="accountsContactEmail"
				type="email"
				value={contact.email}
				maxlength={longestAccountsContactEmail}
				class={fieldClasses}
			/>
		</FormField>
		<FormField label="Phone" class="max-w-48">
			<input
				name="accountsContactPhone"
				value={contact.phone}
				maxlength={longestAccountsContactPhone}
				class={fieldClasses}
			/>
		</FormField>
	</div>
</fieldset>
