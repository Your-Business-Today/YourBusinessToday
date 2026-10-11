<script lang="ts">
	import HarnessDoorCard from './HarnessDoorCard.svelte';
	import HarnessFlowArrow from './HarnessFlowArrow.svelte';
	import HarnessTableCard from './HarnessTableCard.svelte';
	import HarnessListCard from './HarnessListCard.svelte';
	import {
		agentSkillExamples,
		dataSourceExamples,
		harnessDoors,
		harnessTables,
		roleBasedAccessLine
	} from '$lib/data/harnessDiagram';
</script>

<figure class="flex flex-col gap-4" aria-label="How the harness fits together">
	<div class="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1.3fr_auto_1fr]">
		<HarnessListCard
			label="Data sources today"
			title="What makes your data now"
			items={dataSourceExamples}
		/>
		<HarnessFlowArrow direction="into" caption="retired into" />
		<div class="flex flex-col gap-3 rounded-2xl border border-signal/50 bg-carriage p-5">
			<p class="font-display text-xs tracking-widest text-signal uppercase">The harness</p>
			<p class="font-display text-lg font-medium">One secure place for all your data</p>
			<div class="grid gap-2 sm:grid-cols-2">
				{#each harnessTables as table (table.name)}
					<HarnessTableCard {table} />
				{/each}
			</div>
		</div>
		<HarnessFlowArrow direction="both" caption="in and out" />
		<HarnessListCard
			label="Assistant skills"
			title="What your AI assistant runs"
			items={agentSkillExamples}
		/>
	</div>
	<div class="grid gap-4 md:grid-cols-2">
		{#each harnessDoors as door (door.id)}
			<HarnessDoorCard {door} />
		{/each}
	</div>
	<figcaption class="rounded-2xl border border-hairline px-5 py-4 text-sm text-chalk/70">
		<span class="font-display text-chalk">Roles.</span>
		{roleBasedAccessLine}
	</figcaption>
</figure>
