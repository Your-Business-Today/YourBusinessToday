<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { ContentLimits } from '$lib/brand/content/contentLimits';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { ReviewVerdicts } from '$lib/brand/content/contentReview';

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/review" use:enhance={tracker.submit(undefined, { shouldKeepFields: true })} class="flex flex-col gap-4">
	<FormField label="Your comment" hint="Say what should change when you ask for a change; it is optional when you approve.">
		<textarea name="body" rows="4" maxlength={ContentLimits.reviewCharacters}></textarea>
	</FormField>
	<FormErrorNote message={tracker.errorMessage} />
	<div class="flex flex-wrap justify-end gap-2">
		<Button type="submit" name="verdict" value={ReviewVerdicts.changesRequested} disabled={tracker.isSaving}>Ask for a change</Button>
		<Button type="submit" look="primary" name="verdict" value={ReviewVerdicts.approved} isSaving={tracker.isSaving}>Approve</Button>
	</div>
</form>
