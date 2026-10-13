<script lang="ts">
	import { isWritingTool, mcpEntryKinds, type McpEntry } from '$lib/data/blueprint/mcpEntries';

	let { entry }: { entry: McpEntry } = $props();

	const kindLabels = { tool: 'Connector tool', skill: 'Skill', agent: 'Agent' } as const;

	function badge(): string {
		if (entry.kind !== mcpEntryKinds.tool) return kindLabels[entry.kind];
		return isWritingTool(entry.name) ? 'Writes' : 'Reads';
	}

	function detail(): string {
		if (entry.kind !== mcpEntryKinds.tool) {
			const { guide } = entry;
			return guide.description;
		}
		const { stories, routes } = entry.tool;
		const storyCount = stories.length;
		const screenCount = routes.length;
		return `${storyCount} ${storyCount === 1 ? 'story' : 'stories'} · ${screenCount} screen${screenCount === 1 ? '' : 's'}`;
	}
</script>

<div class="flex h-full flex-col gap-2 p-3">
	<span class="self-start rounded-full bg-go/15 px-2 py-0.5 font-display text-[10px] tracking-widest text-go uppercase">
		{badge()}
	</span>
	<p class="font-mono text-sm break-all text-chalk/90">{entry.name}</p>
	<p class="line-clamp-5 text-[11px] text-chalk/50">{detail()}</p>
</div>
