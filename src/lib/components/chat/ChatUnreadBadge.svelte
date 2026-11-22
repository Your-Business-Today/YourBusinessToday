<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';

	let { unreadCount }: { unreadCount: number } = $props();

	const hasUnread = $derived(unreadCount > 0);
</script>

{#if hasUnread}
	<span title={`${unreadCount} new since you last looked`}>
		<Badge label={unreadCount} tone="positive" hasDot />
	</span>
{/if}
