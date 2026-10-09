<script lang="ts">
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/markAllRead" use:enhance={tracker.submit()}>
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Marking…"
		class="rounded-full border border-hairline px-4 py-1.5 font-display text-xs
			text-chalk/70 transition hover:border-go hover:text-go"
	>
		Mark all read
	</SubmitButton>
</form>
