<script lang="ts">
	import { enhance } from '$app/forms';
	import PersonInitials from '$lib/components/workspace/PersonInitials.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { managerLabel } from '$lib/data/organisationStanding';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';

	let {
		member,
		canManage,
		onRemove
	}: { member: OrganisationMember; canManage: boolean; onRemove: (member: OrganisationMember) => void } =
		$props();

	const tracker = new FormTracker();
	const isNamedApartFromEmail = $derived(member.name !== member.email);
	const standingToggleLabel = $derived(member.isManager ? 'Make member' : 'Make manager');
</script>

<li class="flex items-center gap-3 px-4 py-2">
	<PersonInitials name={member.name} />
	<span class="flex min-w-0 flex-1 flex-col">
		<span class="flex min-w-0 items-center gap-2">
			<span class="truncate font-display text-sm">{member.name}</span>
			{#if member.isManager}
				<span class="shrink-0 rounded-full bg-go/15 px-2 py-0.5 text-[0.7rem] text-go">{managerLabel}</span>
			{/if}
		</span>
		{#if isNamedApartFromEmail}
			<span class="truncate text-xs text-chalk/50">{member.email}</span>
		{/if}
	</span>
	{#if canManage}
		<form method="POST" action="?/setManager" use:enhance={tracker.submit()}>
			<input type="hidden" name="accountId" value={member.id} />
			<input type="hidden" name="isManager" value={member.isManager ? 'false' : 'true'} />
			<button
				type="submit"
				disabled={tracker.isSaving}
				class="shrink-0 rounded-full border border-hairline px-2.5 py-0.5 font-display text-xs text-chalk/60 transition hover:border-go hover:text-go disabled:opacity-60"
			>
				{standingToggleLabel}
			</button>
		</form>
		<button
			type="button"
			onclick={() => onRemove(member)}
			aria-label={`Remove ${member.name}`}
			class="shrink-0 rounded-md px-2 py-1 text-chalk/40 transition hover:text-signal"
		>
			✕
		</button>
	{/if}
</li>
