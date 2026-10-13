<script lang="ts">
	import PortalRequestReplyForm from './PortalRequestReplyForm.svelte';
	import type { PortalRequest } from '$lib/portal/portalRequest';

	let { request }: { request: PortalRequest } = $props();

	const hasResolution = $derived(request.resolution !== '');
</script>

<li class="flex flex-col gap-3 px-4 py-3">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<span class="min-w-0 text-sm text-chalk">{request.title}</span>
		<span class="shrink-0 font-display text-xs text-chalk/60">{request.statusLabel}</span>
	</div>
	<p class="text-sm whitespace-pre-line text-chalk/70">{request.details}</p>
	{#each request.messages as message (message.id)}
		<div class="flex flex-col gap-0.5 border-l-2 border-hairline pl-3">
			<span class="text-xs text-chalk/50">{message.isFromVisitor ? 'You' : message.authorName}</span>
			<p class="text-sm whitespace-pre-line text-chalk/80">{message.body}</p>
		</div>
	{/each}
	{#if hasResolution}
		<p class="text-sm text-go">{request.resolution}</p>
	{/if}
	{#if !request.isDone}
		<PortalRequestReplyForm requestId={request.id} />
	{/if}
</li>
