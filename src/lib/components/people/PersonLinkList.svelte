<script lang="ts">
	import PersonLinkChip from './PersonLinkChip.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import type { PersonLink } from '$lib/server/people/getLinksForPeople';

	let { personId, links }: { personId: string; links: PersonLink[] } = $props();
</script>

<div class="flex flex-col gap-2">
	<ul class="flex flex-wrap gap-2">
		{#each links as link (link.id)}
			<PersonLinkChip {link} />
		{/each}
	</ul>
	<form method="POST" action="?/addLink" class="flex flex-wrap items-center gap-2">
		<input type="hidden" name="personId" value={personId} />
		<input
			name="label"
			required
			placeholder="LinkedIn"
			aria-label="Link label"
			class={`${inputClasses} w-32 py-1 text-sm`}
		/>
		<input
			name="url"
			type="url"
			required
			placeholder="https://"
			aria-label="Link address"
			class={`${inputClasses} min-w-0 flex-1 py-1 text-sm`}
		/>
		<SubmitButton class={quietButtonClasses}>Add link</SubmitButton>
	</form>
</div>
