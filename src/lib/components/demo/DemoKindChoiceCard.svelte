<script lang="ts">
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import type { DemoKindChoice } from '$lib/data/demo/demoKindChoices';

	let { choice }: { choice: DemoKindChoice } = $props();

	let isStarting = $state(false);
</script>

<form method="POST" action="?/start" use:enhance={() => {
	isStarting = true;
	return async ({ update }) => {
		await update();
		isStarting = false;
	};
}} class="flex flex-col items-start gap-4 rounded-2xl border border-hairline p-6">
	<input type="hidden" name="kind" value={choice.kind} />
	<h2 class="font-display text-2xl font-medium">{choice.label}</h2>
	<p class="text-chalk/70">{choice.sentence}</p>
	<SubmitButton isSaving={isStarting} savingLabel="Starting your copy…">
		Try it as {choice.label.toLowerCase()}
	</SubmitButton>
</form>
