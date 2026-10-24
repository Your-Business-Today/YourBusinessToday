<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses, primaryButtonClasses } from '$lib/components/site/formStyles';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { enquiryFieldLimits, enquiryHoneypotField } from '$lib/data/enquiryForm';

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/bookDiscoveryCall"
	use:enhance={tracker.submit(undefined, { shouldKeepFields: true })}
	class="relative flex flex-col gap-4"
>
	<div class="grid gap-4 sm:grid-cols-2">
		<FormField label="Your name">
			<input name="name" autocomplete="name" required maxlength={enquiryFieldLimits.name} class={inputClasses} />
		</FormField>
		<FormField label="Email">
			<input
				name="email"
				type="email"
				autocomplete="email"
				required
				maxlength={enquiryFieldLimits.email}
				class={inputClasses}
			/>
		</FormField>
		<FormField label="Phone">
			<input
				name="phone"
				type="tel"
				autocomplete="tel"
				required
				maxlength={enquiryFieldLimits.phone}
				class={inputClasses}
			/>
		</FormField>
		<FormField label="Company">
			<input
				name="company"
				autocomplete="organization"
				maxlength={enquiryFieldLimits.company}
				class={inputClasses}
			/>
		</FormField>
		<FormField label="Website (optional)">
			<input
				name="website"
				type="url"
				autocomplete="url"
				placeholder="https://"
				maxlength={enquiryFieldLimits.website}
				class={inputClasses}
			/>
		</FormField>
		<FormField label="When suits you for a call? (optional)">
			<input
				name="whenSuits"
				placeholder="Tuesday or Thursday afternoon"
				maxlength={enquiryFieldLimits.whenSuits}
				class={inputClasses}
			/>
		</FormField>
	</div>
	<FormField label="Tell us about your business">
		<textarea
			name="message"
			rows="5"
			required
			placeholder="What the business does, where the time goes, and what you wish ran itself."
			maxlength={enquiryFieldLimits.message}
			class={inputClasses}
		></textarea>
	</FormField>
	<label class="absolute -left-[9999px] opacity-0" aria-hidden="true">
		Leave this empty
		<input name={enquiryHoneypotField} tabindex="-1" autocomplete="off" />
	</label>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} savingLabel="Sending…" class={primaryButtonClasses}>
		Request my call
	</SubmitButton>
</form>
