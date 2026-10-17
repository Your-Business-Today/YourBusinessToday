<script lang="ts">
	import TaskAutocompleteModal from './TaskAutocompleteModal.svelte';
	import { autocompleteSentence } from '$lib/data/autocomplete';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task, goalSetting }: { task: ProjectTask; goalSetting: boolean | null } = $props();

	let isModalOpen = $state(false);
</script>

<div class="flex items-center justify-between gap-3 border-t border-hairline px-4 py-3 text-sm">
	<p class="font-display text-chalk/70">{autocompleteSentence(task.autocompleteSetting, goalSetting)}</p>
	<button
		type="button"
		onclick={() => (isModalOpen = true)}
		class="shrink-0 rounded-full border border-hairline px-3 py-1 font-display text-xs text-chalk/70
			transition hover:border-go hover:text-go"
	>
		Change
	</button>
</div>

<TaskAutocompleteModal {task} {goalSetting} bind:isOpen={isModalOpen} />
