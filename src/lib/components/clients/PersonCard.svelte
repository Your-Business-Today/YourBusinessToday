<script lang="ts">
	import PersonFacts from '$lib/components/people/PersonFacts.svelte';
	import PersonLinkList from '$lib/components/people/PersonLinkList.svelte';
	import PersonNoteTimeline from '$lib/components/people/PersonNoteTimeline.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { confirmButtonClasses, panelClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import type { ClientPerson } from '$lib/server/clients/getPeopleForClient';

	let { person, onEdit }: { person: ClientPerson; onEdit: (person: ClientPerson) => void } = $props();

	const contactLine = $derived(
		[person.role || person.officerRole, person.email, person.phone].filter(Boolean).join(' · ')
	);
	const canInvite = $derived(person.email !== '' && person.invitedAt === null);
	const otherCompanies = $derived(
		person.otherCompanyCount === 0
			? ''
			: `also at ${person.otherCompanyCount} other compan${person.otherCompanyCount === 1 ? 'y' : 'ies'}`
	);
</script>

<article class={panelClasses}>
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0">
			<p class="font-display">
				<a href={`/people/${person.id}`} class="hover:text-signal">{person.name}</a>
				{#if person.isPrimary}
					<span class="ml-2 rounded-full bg-chalk/10 px-2 py-0.5 text-xs text-chalk/60">primary</span>
				{/if}
				{#if otherCompanies !== ''}
					<a href={`/people/${person.id}`} class="ml-2 text-xs text-chalk/50 hover:text-signal">{otherCompanies}</a>
				{/if}
			</p>
			<p class="text-xs text-chalk/50">{contactLine === '' ? 'No details yet' : contactLine}</p>
			{#if person.sourceUrl !== ''}
				<p class="text-xs text-chalk/40">
					Found on <a href={person.sourceUrl} class="hover:text-signal">{person.sourceUrl}</a>
				</p>
			{/if}
		</div>
		<div class="flex flex-wrap gap-2">
			<button type="button" class={quietButtonClasses} onclick={() => onEdit(person)}>Edit</button>
			<form method="POST" action="?/draftApproach">
				<input type="hidden" name="personId" value={person.id} />
				<SubmitButton class={confirmButtonClasses} savingLabel="Drafting…">Draft approach</SubmitButton>
			</form>
			{#if canInvite}
				<form method="POST" action="?/inviteContact">
					<input type="hidden" name="contactId" value={person.contactId} />
					<SubmitButton class={quietButtonClasses} savingLabel="Inviting…">Invite</SubmitButton>
				</form>
			{/if}
			{#if person.invitedAt !== null}
				<p class="self-center text-xs text-chalk/40">Invited {formatBritishDate(person.invitedAt)}</p>
			{/if}
		</div>
	</div>
	<PersonFacts {person} />
	<PersonLinkList personId={person.id} links={person.links} />
	<PersonNoteTimeline personId={person.id} notes={person.notes} />
</article>
