<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { filedEmailDirectionLabels, gmailThreadLink, type FiledEmail } from '$lib/data/filedEmailRules';
	import { quietButtonClasses } from '$lib/components/site/formStyles';

	let { email }: { email: FiledEmail } = $props();

	const tracker = new FormTracker();
	const subject = $derived(email.subject === '' ? '(no subject)' : email.subject);
</script>

<RecordsCell label="When">{formatBritishDate(email.sentAt)}</RecordsCell>
<RecordsCell label="In or out" isWideOnly>{filedEmailDirectionLabels[email.direction]}</RecordsCell>
<RecordsCell label="From">{email.from}</RecordsCell>
<RecordsCell label="Subject">
	<span class="flex flex-col gap-1">
		<span class="text-chalk">{subject}</span>
		<span class="line-clamp-2 text-sm text-chalk-muted">{email.summary}</span>
	</span>
</RecordsCell>
<RecordsCell kind="actions">
	<span class="inline-flex items-center gap-2">
		<a href={gmailThreadLink(email)} target="_blank" rel="noopener noreferrer" class={quietButtonClasses}>Open in Gmail</a>
		<form method="POST" action="?/unfileEmail" use:enhance={tracker.submit()}>
			<input type="hidden" name="filedEmailId" value={email.id} />
			<Button look="ghost" type="submit" isSaving={tracker.isSaving}>Unfile</Button>
		</form>
	</span>
</RecordsCell>
