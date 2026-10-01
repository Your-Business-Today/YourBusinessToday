<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let { person }: { person: ProjectPerson } = $props();

	const tracker = new FormTracker();
</script>

<li
	class="flex max-w-full min-w-0 items-center gap-1 rounded-full border border-hairline py-0.5 pr-1 pl-3
		font-display text-xs text-chalk/80"
>
	<span class="truncate">{person.name}</span>
	<form method="POST" action="?/removeParticipant" use:enhance={tracker.submit()}>
		<input type="hidden" name="accountId" value={person.id} />
		<button
			type="submit"
			disabled={tracker.isSaving}
			aria-label={`Take ${person.name} out of the conversation`}
			class="flex h-5 w-5 items-center justify-center rounded-full text-chalk/50 transition
				hover:bg-signal/20 hover:text-signal disabled:opacity-60"
		>
			×
		</button>
	</form>
</li>
