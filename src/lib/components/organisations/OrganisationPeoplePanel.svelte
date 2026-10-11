<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import InviteMemberForm from './InviteMemberForm.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import OrganisationMemberRow from './OrganisationMemberRow.svelte';
	import { panelButtonClasses, panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';

	let {
		organisation,
		parent,
		members,
		canManage
	}: {
		organisation: Organisation;
		parent: Organisation | null;
		members: OrganisationMember[];
		canManage: boolean;
	} = $props();

	let isInviteModalOpen = $state(false);
	let isRemoveModalOpen = $state(false);
	let memberAwaitingRemoval = $state<OrganisationMember | null>(null);

	function openRemoveModal(member: OrganisationMember) {
		memberAwaitingRemoval = member;
		isRemoveModalOpen = true;
	}
</script>

<DashboardPanel title="People" count={members.length}>
	{#snippet actions()}
		{#if canManage}
			<button type="button" onclick={() => (isInviteModalOpen = true)} class={panelButtonClasses}>＋ Invite</button>
		{/if}
	{/snippet}
	<ul class={panelListClasses}>
		{#each members as member (member.id)}
			<OrganisationMemberRow {member} {canManage} onRemove={openRemoveModal} />
		{/each}
	</ul>
	{#if members.length === 0}
		<p class={panelEmptyClasses}>Nobody is on {organisation.name} itself yet.</p>
	{/if}
	{#if parent !== null}
		<p class="border-t border-hairline px-4 py-3 text-xs text-chalk/50">
			Everyone on <a href={`/organisations/${parent.id}`} class="text-chalk/70 hover:text-go">{parent.name}</a>
			reaches these projects as well.
		</p>
	{/if}
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
