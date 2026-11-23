<script lang="ts">
	import type { SkillArea } from '$lib/data/publishedSkill';

	let { skillArea, isOpen }: { skillArea: SkillArea; isOpen: boolean } = $props();
</script>

<details open={isOpen} class="flex flex-col gap-4">
	<summary class="cursor-pointer font-display text-2xl font-medium">
		{skillArea.label} ({skillArea.skillCount})
	</summary>
	<dl class="mt-4 flex flex-col gap-5">
		{#each skillArea.skills as skill (skill.name)}
			<div class="flex flex-col gap-1">
				<dt class="font-mono text-sm text-chalk">
					{skill.name}{skill.isWrite ? ' — changes records' : ' — only reads'}
				</dt>
				<dd class="text-chalk/80">{skill.summary}</dd>
				{#if skill.howItWorks !== null}
					<dd class="text-sm text-chalk/60">How it goes about it: {skill.howItWorks}</dd>
				{/if}
			</div>
		{/each}
	</dl>
</details>
