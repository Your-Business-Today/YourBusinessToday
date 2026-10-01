<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { AcceptanceCriterion } from '$lib/server/projects/criterionRecord';

	let { criterion }: { criterion: AcceptanceCriterion } = $props();

	const tracker = new FormTracker();
</script>

<li class="flex items-center gap-3 px-4 py-2.5" class:animate-pulse={tracker.isSaving}>
	<form method="POST" action="?/setCriterionMet" use:enhance={tracker.submit()}>
		<input type="hidden" name="criterionId" value={criterion.id} />
		<input type="hidden" name="isMet" value={criterion.isMet ? 'false' : 'true'} />
		<button
			type="submit"
			disabled={tracker.isSaving}
			aria-label={criterion.isMet ? 'Mark as not met' : 'Mark as met'}
			class={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition
				${criterion.isMet ? 'border-go bg-go/20 text-go' : 'border-hairline text-chalk/40 hover:border-go'}`}
		>
			{criterion.isMet ? '✓' : ''}
		</button>
	</form>
	<p class={`flex-1 text-sm ${criterion.isMet ? 'text-chalk/50 line-through' : 'text-chalk/90'}`}>
		{criterion.description}
	</p>
	<form method="POST" action="?/deleteCriterion" use:enhance={tracker.submit()}>
		<input type="hidden" name="criterionId" value={criterion.id} />
		<button
			type="submit"
			disabled={tracker.isSaving}
			aria-label="Delete criterion"
			class="px-1 text-chalk/40 transition hover:text-signal"
		>
			✕
		</button>
	</form>
</li>
