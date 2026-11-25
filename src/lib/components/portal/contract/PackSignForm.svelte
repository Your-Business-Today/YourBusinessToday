<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { contractPackSigningLimits as limits, packSigningFields as fields } from '$lib/data/contractPackSigningRules';

	let { documentId, versionNumber, today }: { documentId: string; versionNumber: number; today: string } = $props();
</script>

<form method="post" action="?/sign" use:enhance class="flex flex-col gap-3">
	<input type="hidden" name={fields.documentId} value={documentId} />
	<input type="hidden" name={fields.versionNumber} value={versionNumber} />
	<FormField label="Your name">
		<input type="text" name={fields.signerName} required maxlength={limits.longestSignerName} />
	</FormField>
	<FormField label="Your position">
		<input type="text" name={fields.signerPosition} required maxlength={limits.longestSignerPosition} />
	</FormField>
	<FormField label="Date">
		<input type="date" name={fields.signedOn} required value={today} />
	</FormField>
	<label class="flex items-start gap-2 text-sm text-chalk/80">
		<input type="checkbox" name={fields.isAuthorisedToSign} required />
		<span>I accept this document, version {versionNumber}, and I am authorised to sign it for my organisation.</span>
	</label>
	<div><Button type="submit" look="primary">Accept and sign</Button></div>
</form>
