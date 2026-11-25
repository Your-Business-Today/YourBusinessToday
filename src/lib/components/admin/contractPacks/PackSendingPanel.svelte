<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import type { PackSendingPlan } from '$lib/data/contractPack';

	let {
		organisationId,
		sending,
		errorMessage
	}: { organisationId: string; sending: PackSendingPlan | string; errorMessage: string | null } = $props();

	let isSending = $state(false);

	function sendingPack() {
		isSending = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isSending = false;
		};
	}
</script>

<section class="flex flex-col gap-3">
	<h2 class="font-display text-lg text-chalk">Send it to the client</h2>
	{#if typeof sending === 'string'}
		<p class="text-sm text-chalk/70">{sending}</p>
	{:else}
		{@const contact = sending.contact}
		<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-chalk/80">
			<dt class="text-chalk/50">From</dt>
			<dd>{sending.from}</dd>
			<dt class="text-chalk/50">To</dt>
			<dd>{contact.name} &lt;{contact.email}&gt;</dd>
			<dt class="text-chalk/50">Subject</dt>
			<dd>{sending.subject}</dd>
			<dt class="text-chalk/50">Link</dt>
			<dd class="break-all">{sending.packUrl}</dd>
		</dl>
		<p class="text-sm text-chalk/60">One email, with one link to these documents in their client portal:</p>
		<ol class="list-decimal pl-5 text-sm text-chalk/80">
			{#each sending.documents as document (document.title)}
				<li>{document.title}, version {document.versionNumber}</li>
			{/each}
		</ol>
		<form method="post" action="?/send" use:enhance={sendingPack} class="flex flex-col gap-3">
			<input type="hidden" name="organisationId" value={organisationId} />
			<input type="hidden" name="packId" value={sending.packId} />
			<input type="hidden" name="contactId" value={contact.id} />
			<Button type="submit" disabled={isSending}>{isSending ? 'Sending…' : `Send to ${contact.name}`}</Button>
		</form>
	{/if}
	<FormErrorNote message={errorMessage} />
</section>
