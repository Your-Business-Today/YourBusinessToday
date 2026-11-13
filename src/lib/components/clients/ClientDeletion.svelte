<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import { dangerButtonClasses } from '$lib/components/site/formStyles';
	import { deletionWarningFor } from '$lib/data/clientDeletion';
	import type { Client } from '$lib/server/clients/clientRecord';

	let { client }: { client: Client } = $props();

	let isConfirmOpen = $state(false);

	const description = $derived(deletionWarningFor(client.name));
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
