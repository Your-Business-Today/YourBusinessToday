<script lang="ts">
	import { boardBriefParts } from '$lib/data/boardBriefForm';
	import type { OwnBriefView } from '$lib/data/boardBriefViews';

	let { brief }: { brief: OwnBriefView } = $props();

	const nothingSaid = 'Nothing said';
	const keptLine = $derived(`Version ${brief.version}, written ${brief.writtenWhen}. Only you see it.`);
</script>

<div class="flex flex-col gap-2 border-l-2 border-go pl-3">
	<p class="text-sm font-medium text-chalk">Your brief</p>
	<dl class="flex flex-col gap-2 text-sm">
		{#each boardBriefParts as part (part.name)}
			<div class="flex flex-col gap-0.5">
				<dt class="text-chalk-subtle">{part.label}</dt>
				<dd class="break-words whitespace-pre-wrap text-chalk">{brief[part.name] ?? nothingSaid}</dd>
			</div>
		{/each}
	</dl>
	<p class="text-xs text-chalk-subtle">{keptLine}</p>
</div>
