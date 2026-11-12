<script lang="ts">
	import { enhance } from '$app/forms';
	import Badge from '$lib/components/site/Badge.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import PersonLine from '$lib/components/workspace/PersonLine.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { standingLabelOf } from '$lib/data/organisationStanding';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';

	let {
		member,
		canManage,
		onRemove
	}: { member: OrganisationMember; canManage: boolean; onRemove: (member: OrganisationMember) => void } =
		$props();

	const tracker = new FormTracker();
	const emailBeneathName = $derived(member.name === member.email ? '' : member.email);
	const standingTone = $derived(member.isManager ? 'positive' : 'neutral');
	const standingToggleLabel = $derived(member.isManager ? 'Make member' : 'Make manager');
	const isManagerAfterToggle = $derived(String(!member.isManager));
</script>

<RecordsCell kind="link"><PersonLine name={member.name} caption={emailBeneathName} /></RecordsCell>
<RecordsCell kind="status" label="Role"><Badge label={standingLabelOf(member.isManager)} tone={standingTone} /></RecordsCell>
<RecordsCell label="On since">{formatBritishDate(member.since)}</RecordsCell>
{#if canManage}
	<RecordsCell kind="actions">
		<span class="inline-flex items-center gap-2">
			<form method="POST" action="?/setManager" use:enhance={tracker.submit()}>
				<input type="hidden" name="accountId" value={member.id} />
				<input type="hidden" name="isManager" value={isManagerAfterToggle} />
				<Button type="submit" isSaving={tracker.isSaving}>{standingToggleLabel}</Button>
			</form>
			<Button look="ghost" onclick={() => onRemove(member)}>Remove</Button>
		</span>
	</RecordsCell>
{/if}
