<script lang="ts">
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import type { PersonLink } from '$lib/server/people/getLinksForPeople';

	let { personId, links }: { personId: string; links: PersonLink[] } = $props();
</script>

<div class="flex flex-col gap-2">
	<ul class="flex flex-wrap gap-2">
		{#each links as link (link.id)}
			<li class="flex items-center gap-1 rounded-full border border-hairline pl-3 text-xs">
				<a href={link.url} target="_blank" rel="noreferrer" class="text-chalk/80 hover:text-signal">
					{link.label}
				</a>
				<form method="POST" action="?/removeLink">
					<input type="hidden" name="linkId" value={link.id} />
					<button
						type="submit"
						aria-label={`Remove ${link.label}`}
						class="px-2 py-1 text-chalk/40 hover:text-signal"
					>
						✕
					</button>
				</form>
			</li>
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
