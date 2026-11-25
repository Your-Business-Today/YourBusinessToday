<script lang="ts">
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { notificationSentence } from '$lib/data/notificationSentence';
	import { notificationCountLabel } from '$lib/data/notificationCountLabel';
	import type { NotificationGroup } from '$lib/server/notifications/notificationGroup';

	let { group, authorName }: { group: NotificationGroup; authorName: string | null } = $props();

	const tracker = new FormTracker();

	const latest = $derived(group.latest);
	const hasUnread = $derived(group.unreadCount > 0);
	const formattedDate = $derived(formatBritishDateTime(latest.createdAt));
	const countLabel = $derived(notificationCountLabel(group.unreadCount, group.notificationCount));

	const sentence = $derived(
		notificationSentence({
			subjectKind: latest.subjectKind,
			subjectTitle: latest.subjectTitle,
			eventKind: latest.eventKind,
			actorName: authorName
		})
	);
	const hasBody = $derived(latest.messageBody !== '');
	const hasFilesShared = $derived(latest.filesShared !== '');
</script>

<li class="flex items-start gap-4 px-5 py-4" class:opacity-60={!hasUnread}>
	{#if hasUnread}
		<span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-go" aria-label="Unread"></span>
	{:else}
		<span class="mt-2 h-2 w-2 shrink-0"></span>
	{/if}
	<div class="min-w-0 flex-1">
		<p class="text-sm">
			<span class="font-display text-chalk/90">{sentence.who}</span>
			<span class="text-chalk/60">{sentence.what}</span>
			<span class="font-display text-chalk/90">{sentence.which}</span>
		</p>
		{#if hasBody}
			<p class="truncate text-sm text-chalk/60">{latest.messageBody}</p>
		{/if}
		{#if hasFilesShared}
			<p class="text-sm text-chalk/60">{latest.filesShared}</p>
		{/if}
		<p class="text-xs text-chalk/40">
			{formattedDate}
			{#if countLabel !== ''}
				<span class:text-go={hasUnread}> · {countLabel}</span>
			{/if}
		</p>
	</div>
	<form method="POST" action="?/openSubject" use:enhance={tracker.submit()}>
		<input type="hidden" name="notificationId" value={latest.id} />
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Opening…"
			class="rounded-full border border-hairline px-4 py-1.5 font-display text-xs text-chalk/70
				transition hover:border-go hover:text-go"
		>
			Open {latest.subjectKind}
		</SubmitButton>
	</form>
</li>
