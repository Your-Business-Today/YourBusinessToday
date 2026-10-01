<script lang="ts">
	import PersonInitials from '$lib/components/workspace/PersonInitials.svelte';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let {
		person,
		canRemove,
		onRemove
	}: { person: ProjectPerson; canRemove: boolean; onRemove: (person: ProjectPerson) => void } =
		$props();

	const isNamedApartFromEmail = $derived(person.name !== person.email);
</script>

<li class="flex items-center gap-3 px-4 py-2">
	<PersonInitials name={person.name} />
	<span class="flex min-w-0 flex-1 flex-col">
		<span class="flex min-w-0 items-center gap-2">
			<span class="truncate font-display text-sm">{person.name}</span>
			{#if person.isOwner}
				<span class="shrink-0 rounded-full bg-go/15 px-2 py-0.5 text-[0.7rem] text-go">Owner</span>
			{/if}
		</span>
		{#if isNamedApartFromEmail}
			<span class="truncate text-xs text-chalk/50">{person.email}</span>
		{/if}
	</span>
	{#if canRemove}
		<button
			type="button"
			onclick={() => onRemove(person)}
			aria-label={`Remove ${person.name}`}
			class="shrink-0 rounded-md px-2 py-1 text-chalk/40 transition hover:text-signal"
		>
			✕
		</button>
	{/if}
</li>
