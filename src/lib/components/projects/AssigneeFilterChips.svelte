<script lang="ts">
	import CountedFilterChip from './CountedFilterChip.svelte';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let {
		people,
		viewerId,
		selectedPersonId,
		countFor,
		onToggle
	}: {
		people: ProjectPerson[];
		viewerId: string;
		selectedPersonId: string | null;
		countFor: (personId: string) => number;
		onToggle: (personId: string) => void;
	} = $props();

	const viewer = $derived(people.filter((person) => person.id === viewerId));
	const others = $derived(people.filter((person) => person.id !== viewerId));
	const peopleViewerFirst = $derived([...viewer, ...others]);

	function labelFor(person: ProjectPerson): string {
		if (person.id === viewerId) return 'Assigned to me';
		return person.name;
	}

	function titleFor(person: ProjectPerson): string {
		if (person.id === viewerId) return 'Open tasks assigned to you';
		return `Open tasks assigned to ${person.name}`;
	}
</script>

{#each peopleViewerFirst as person (person.id)}
	<CountedFilterChip
		label={labelFor(person)}
		title={titleFor(person)}
		count={countFor(person.id)}
		countTone="plain"
		isSelected={selectedPersonId === person.id}
		onToggle={() => onToggle(person.id)}
	/>
{/each}
