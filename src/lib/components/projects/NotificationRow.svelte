<script lang="ts">
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { notificationSentence } from '$lib/data/notificationSentence';
	import type { NotificationListItem } from '$lib/server/notifications/notificationListItem';

	let {
		notification,
		authorName
	}: { notification: NotificationListItem; authorName: string | null } = $props();

	const tracker = new FormTracker();

	const formattedDate = $derived(formatBritishDateTime(notification.createdAt));

	const sentence = $derived(
		notificationSentence({
			subjectKind: notification.subjectKind,
			subjectTitle: notification.subjectTitle,
			eventKind: notification.eventKind,
			actorName: authorName
		})
	);
	const hasBody = $derived(notification.messageBody !== '');
</script>

<li class="flex items-start gap-4 px-5 py-4" class:opacity-60={notification.isRead}>
	{#if !notification.isRead}
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
			<p class="truncate text-sm text-chalk/60">{notification.messageBody}</p>
		{/if}
		<p class="text-xs text-chalk/40">{formattedDate}</p>
	</div>
	<form method="POST" action="?/openNotification" use:enhance={tracker.submit()}>
		<input type="hidden" name="notificationId" value={notification.id} />
		<input type="hidden" name="projectId" value={notification.projectId} />
		<input type="hidden" name="subjectKind" value={notification.subjectKind} />
		<input type="hidden" name="subjectId" value={notification.subjectId} />
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Opening…"
			class="rounded-full border border-hairline px-4 py-1.5 font-display text-xs text-chalk/70
				transition hover:border-go hover:text-go"
		>
			Open {notification.subjectKind}
		</SubmitButton>
	</form>
</li>
