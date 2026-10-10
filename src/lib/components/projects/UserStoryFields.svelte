<script lang="ts">
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task }: { task: ProjectTask } = $props();

	let isUserStoryOverride = $state<boolean | null>(null);

	function chooseUserStory(event: Event & { currentTarget: HTMLInputElement }): void {
		const checkbox = event.currentTarget;
		isUserStoryOverride = checkbox.checked;
	}

	const isUserStory = $derived(isUserStoryOverride ?? task.isUserStory);
	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<div class="flex flex-col gap-4 rounded-xl border border-hairline p-4">
	<label class="flex items-center gap-3">
		<input
			type="checkbox"
			name="isUserStory"
			checked={isUserStory}
			onchange={chooseUserStory}
			class="accent-go"
		/>
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">
			This task is a user story
		</span>
	</label>
	{#if isUserStory}
		<div class="grid gap-4 sm:grid-cols-3">
			<label class="flex flex-col gap-1">
				<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">As a…</span>
				<input
					name="storyRole"
					value={task.storyRole}
					placeholder="workspace owner"
					class={fieldClasses}
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">I want…</span>
				<input
					name="storyWant"
					value={task.storyWant}
					placeholder="to share my map"
					class={fieldClasses}
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">So that…</span>
				<input
					name="storyBenefit"
					value={task.storyBenefit}
					placeholder="my team sees progress"
					class={fieldClasses}
				/>
			</label>
		</div>
	{/if}
</div>
