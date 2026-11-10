<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import { dangerButtonClasses } from '$lib/components/site/formStyles';
	import type { Client } from '$lib/server/clients/clientRecord';

	let { client }: { client: Client } = $props();

	let isConfirmOpen = $state(false);

	const description = $derived(
		`This deletes “${client.name}” from the register with its contacts and its history, and records the ` +
			'deletion under your name. It is for a duplicate or a mistake: a client with projects, invoices, ' +
			'companies grouped under it or a continuity copy is refused, and belongs at dormant or lost instead.'
	);
</script>

<section class="flex items-center justify-between gap-4">
	<p class="text-sm text-chalk/50">On the register by mistake, or twice?</p>
	<button class={dangerButtonClasses} onclick={() => (isConfirmOpen = true)}>Delete client</button>
</section>

<DangerConfirmModal
	title="Delete client"
	{description}
	action="?/deleteClient"
	fields={{}}
	submitLabel="Delete client"
	confirmWord={client.name}
	bind:isOpen={isConfirmOpen}
/>
