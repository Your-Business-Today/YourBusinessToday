<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let { people }: { people: ProjectPerson[] } = $props();
</script>

<SmallCapsField label="Owner">
	<select name="ownerId" class={fieldClasses}>
		<option value="">Nobody yet</option>
		{#each people as person (person.id)}
			<option value={person.id}>{person.name}</option>
		{/each}
	</select>
</SmallCapsField>
