<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import InviteMemberForm from './InviteMemberForm.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import OrganisationMemberCells from './OrganisationMemberCells.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { paneToolbarClasses } from '$lib/components/workspace/workspaceStyles';
	import { standingLabelOf } from '$lib/data/organisationStanding';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let {
		organisation,
		members,
		canManage
	}: {
		organisation: Organisation;
		members: OrganisationMember[];
		canManage: boolean;
	} = $props();

	let isInviteModalOpen = $state(false);
	let isRemoveModalOpen = $state(false);
	let memberAwaitingRemoval = $state<OrganisationMember | null>(null);

	const personColumns: RecordsColumn<OrganisationMember>[] = [
		{ key: 'person', label: 'Person', sortValue: (member) => member.name },
		{ key: 'role', label: 'Role', sortValue: (member) => standingLabelOf(member.isManager) },
		{ key: 'since', label: 'On since', sortValue: (member) => member.since }
	];
	const actionsColumn: RecordsColumn<OrganisationMember> = { key: 'actions', label: '' };
	const columns = $derived(canManage ? [...personColumns, actionsColumn] : personColumns);

	function openRemoveModal(member: OrganisationMember) {
		memberAwaitingRemoval = member;
		isRemoveModalOpen = true;
	}
</script>

{#if canManage}
	<div class={paneToolbarClasses}>
		<Button look="primary" onclick={() => (isInviteModalOpen = true)}>Invite person</Button>
	</div>
{/if}

<DashboardPanel>
	<RecordsTable
		label={`People on ${organisation.name}`}
		{columns}
		rows={members}
		keyOf={(member) => member.id}
		isCardsOnPhone
		emptyMessage={`Nobody is on ${organisation.name} yet.`}
	>
		{#snippet cells(member)}
			<OrganisationMemberCells {member} {canManage} onRemove={openRemoveModal} />
		{/snippet}
	</RecordsTable>
</DashboardPanel>

<Modal title={`Invite someone to ${organisation.name}`} bind:isOpen={isInviteModalOpen}>
	<InviteMemberForm organisationName={organisation.name} onInvited={() => (isInviteModalOpen = false)} />
</Modal>

{#if memberAwaitingRemoval !== null}
	<DangerConfirmModal
		title="Remove from organisation"
		description={`Remove ${memberAwaitingRemoval.name} from ${organisation.name}? They lose every project it gave them straight away; nothing they said or did is deleted.`}
		action="?/removeMember"
		fields={{ accountId: memberAwaitingRemoval.id }}
		submitLabel="Remove"
		bind:isOpen={isRemoveModalOpen}
	/>
{/if}
