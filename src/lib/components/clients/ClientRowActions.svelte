<script lang="ts">
	import ActionsMenu, { menuItemClasses } from '$lib/components/site/ActionsMenu.svelte';
	import ClientStageModal from './ClientStageModal.svelte';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import { deletionWarningFor } from '$lib/data/clientDeletion';
	import type { ClientSummary } from '$lib/server/clients/listClients';

	let { client }: { client: ClientSummary } = $props();

	let isMenuOpen = $state(false);
	let isStageOpen = $state(false);
	let isDeleteOpen = $state(false);

	const deleteItemClasses =
		'w-full rounded px-3 py-2 text-left font-display text-sm text-signal/90 transition hover:bg-signal/10 hover:text-signal';

	function openStage() {
		isMenuOpen = false;
		isStageOpen = true;
	}

	function openDelete() {
		isMenuOpen = false;
		isDeleteOpen = true;
	}
</script>

<ActionsMenu subjectName={client.name} menuWidthClass="w-44" isCompact bind:isOpen={isMenuOpen}>
	<button type="button" role="menuitem" onclick={openStage} class={menuItemClasses}>Set status…</button>
	<button type="button" role="menuitem" onclick={openDelete} class={deleteItemClasses}>Delete…</button>
</ActionsMenu>

<ClientStageModal clientId={client.id} clientName={client.name} stage={client.stage} bind:isOpen={isStageOpen} />

<DangerConfirmModal
	title="Delete {client.name}"
	description={deletionWarningFor(client.name)}
	action="?/deleteFromRegister"
	fields={{ clientId: client.id }}
	submitLabel="Delete"
	bind:isOpen={isDeleteOpen}
/>
