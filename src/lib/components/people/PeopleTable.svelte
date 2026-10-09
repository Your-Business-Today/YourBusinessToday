<script lang="ts">
	import PersonRow from './PersonRow.svelte';
	import type { PersonSummary } from '$lib/server/people/getPeople';

	let { people }: { people: PersonSummary[] } = $props();
</script>

<ul class="divide-y divide-hairline rounded-2xl border border-hairline">
	{#each people as person (person.id)}
		<PersonRow {person} />
	{/each}
</ul>
