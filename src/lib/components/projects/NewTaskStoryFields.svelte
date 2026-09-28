<script lang="ts">
	import { bugFixTitlePrefix } from '$lib/data/userStoryRule';

	let { isStoryRequired }: { isStoryRequired: boolean } = $props();

	const storyParts = [
		{ name: 'storyRole', label: 'As a…', placeholder: 'site manager at Jewel' },
		{ name: 'storyWant', label: 'I want…', placeholder: 'to record the day from my phone' },
		{ name: 'storyBenefit', label: 'So that…', placeholder: 'the weekly report writes itself' }
	];
	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<fieldset class="flex flex-col gap-3 rounded-xl border border-caution/30 p-4">
	<legend class="px-2 font-display text-sm tracking-widest text-caution uppercase">
		<span aria-hidden="true">◆</span> User story
	</legend>
	<div class="grid gap-4 sm:grid-cols-3">
		{#each storyParts as storyPart (storyPart.name)}
			<label class="flex flex-col gap-1">
				<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">
					{storyPart.label}
				</span>
				<input
					name={storyPart.name}
					required={isStoryRequired}
					placeholder={storyPart.placeholder}
					class={fieldClasses}
				/>
			</label>
		{/each}
	</div>
	<p class="text-xs text-chalk/50">
		{#if isStoryRequired}
			Every task is a user story unless it is a bug — title a bug “{bugFixTitlePrefix} what is
			wrong” and the story can be left out.
		{:else}
			Not needed for a bug fix or a support question — fill it in if there is a story behind it.
		{/if}
	</p>
</fieldset>
