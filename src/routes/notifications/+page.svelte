<script lang="ts">
	import MarkAllReadForm from '$lib/components/projects/MarkAllReadForm.svelte';
	import NotificationRow from '$lib/components/projects/NotificationRow.svelte';
	import { accountNameLookup } from '$lib/data/accountNames';

	let { data } = $props();

	const hasUnread = $derived(data.notifications.some((notification) => !notification.isRead));

	const authorName = $derived(accountNameLookup(data.authors));

	function nameOrNobody(accountId: string | null): string | null {
		if (accountId === null) return null;
		return authorName(accountId);
	}
</script>

<svelte:head>
	<title>Notifications — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
	<div class="flex items-baseline justify-between gap-4">
		<h1 class="font-display text-3xl font-medium">Notifications</h1>
		{#if hasUnread}
			<MarkAllReadForm />
		{/if}
	</div>
	{#if data.notifications.length === 0}
		<p class="rounded-2xl border border-dashed border-hairline p-8 text-center text-chalk/60">
			Nothing yet — you'll be told when someone posts on a task or goal whose conversation you are in, and
			when a task you asked for is done.
		</p>
	{:else}
		<ul class="flex flex-col divide-y divide-hairline rounded-2xl border border-hairline">
			{#each data.notifications as notification (notification.id)}
				<NotificationRow {notification} authorName={nameOrNobody(notification.messageAuthorId)} />
			{/each}
		</ul>
	{/if}
</div>
