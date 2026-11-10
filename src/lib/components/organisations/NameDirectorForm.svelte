<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';

	let { candidates }: { candidates: OrganisationMember[] } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/setDirector" use:enhance={tracker.submit()} class="flex items-center gap-2 border-t border-hairline px-4 py-3">
	<input type="hidden" name="isDirector" value="true" />
	<label class="sr-only" for="director-candidate">Person to name a director</label>
	<select
		id="director-candidate"
		name="accountId"
		required
		class="min-w-0 flex-1 rounded-md border border-hairline bg-transparent px-2 py-1 text-sm text-chalk"
	>
		{#each candidates as candidate (candidate.id)}
			<option value={candidate.id}>{candidate.name}</option>
		{/each}
	</select>
	<button
		type="submit"
		disabled={tracker.isSaving}
		class="shrink-0 rounded-full border border-hairline px-2.5 py-0.5 font-display text-xs text-chalk/60 transition hover:border-go hover:text-go disabled:opacity-60"
	>
		Name director
	</button>
</form>
