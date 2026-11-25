<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { contractPackSigningLimits as limits, packSigningFields as fields } from '$lib/data/contractPackSigningRules';

	let { documentId }: { documentId: string } = $props();
</script>

<form method="post" action="?/comment" use:enhance class="flex flex-col gap-3">
	<input type="hidden" name={fields.documentId} value={documentId} />
	<FormField label="Clause" hint="Such as 9.1; leave empty for the document as a whole">
		<input type="text" name={fields.clause} maxlength={limits.longestClause} />
	</FormField>
	<FormField label="Your comment">
		<textarea name={fields.comment} rows="3" required maxlength={limits.longestComment}></textarea>
	</FormField>
	<div><Button type="submit">Send the comment to Your Business Today</Button></div>
</form>
