<script lang="ts">
	import {
		longestAccountsContactEmail,
		longestAccountsContactName,
		longestAccountsContactPhone,
		longestOrganisationAddress,
		longestOrganisationName,
		type OrganisationDetails
	} from '$lib/data/organisationRules';
	import { organisationFieldClasses, organisationLabelClasses } from './organisationFormStyles';

	let { details, namePlaceholder }: { details: OrganisationDetails; namePlaceholder: string } = $props();

	const contact = $derived(details.accountsContact);
</script>

<label class="flex flex-col gap-1">
	<span class={organisationLabelClasses}>Name</span>
	<input
		name="name"
		required
		value={details.name}
		placeholder={namePlaceholder}
		maxlength={longestOrganisationName}
		class={organisationFieldClasses}
	/>
</label>
<label class="flex flex-col gap-1">
	<span class={organisationLabelClasses}>Address</span>
	<textarea
		name="address"
		rows="3"
		placeholder="As it goes on an invoice"
		maxlength={longestOrganisationAddress}
		class={organisationFieldClasses}>{details.address}</textarea
	>
</label>
<fieldset class="flex flex-col gap-3 rounded-xl border border-hairline p-4">
	<legend class={`px-1 ${organisationLabelClasses}`}>Accounts contact</legend>
	<label class="flex flex-col gap-1">
		<span class="text-xs text-chalk/50">Name</span>
		<input
			name="accountsContactName"
			value={contact.name}
			maxlength={longestAccountsContactName}
			class={organisationFieldClasses}
		/>
	</label>
	<div class="flex flex-wrap gap-3">
		<label class="flex min-w-48 flex-1 flex-col gap-1">
			<span class="text-xs text-chalk/50">Email</span>
			<input
				name="accountsContactEmail"
				type="email"
				value={contact.email}
				maxlength={longestAccountsContactEmail}
				class={organisationFieldClasses}
			/>
		</label>
		<label class="flex max-w-48 flex-col gap-1">
			<span class="text-xs text-chalk/50">Phone</span>
			<input
				name="accountsContactPhone"
				value={contact.phone}
				maxlength={longestAccountsContactPhone}
				class={organisationFieldClasses}
			/>
		</label>
	</div>
</fieldset>
