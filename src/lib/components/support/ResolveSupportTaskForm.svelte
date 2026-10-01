<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	const tracker = new FormTracker();
</script>

<section class="flex flex-col gap-3 rounded-xl border border-signal/40 bg-signal/5 p-4">
	<h2 class="font-display text-sm tracking-widest text-signal uppercase">Resolve</h2>
	<p class="text-sm text-chalk/70">
		The resolution is the answer the person who raised this reads, word for word. It is posted
		into the conversation and closes the task.
	</p>
	<FormErrorNote message={tracker.errorMessage} />
	<form method="POST" action="?/resolve" use:enhance={tracker.submit()} class="flex flex-col gap-3">
		<textarea
			name="resolution"
			required
			rows="3"
			placeholder="What was done, or why not, and what they can do next"
			class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
				focus:border-go"
		></textarea>
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Resolving…"
			class="self-end rounded-full bg-signal px-6 py-2.5 font-display text-sm font-medium
				text-night transition hover:brightness-110"
		>
			Resolve task
		</SubmitButton>
	</form>
</section>
