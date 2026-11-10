<script lang="ts">
	import { describeByteCount } from '$lib/data/taskAttachmentRules';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { KeptBusinessBrainFile } from '$lib/server/businessBrain/readKeptBusinessBrainFiles';

	let { file, href }: { file: KeptBusinessBrainFile; href: string } = $props();
</script>

<li class="flex min-w-0 flex-col gap-0.5 px-6 py-3">
	<a {href} target="_blank" rel="noreferrer" class="truncate font-display text-chalk transition hover:text-go">
		{file.filename}
	</a>
	<span class="text-xs text-chalk-subtle">{describeByteCount(file.byteCount)} · {formatBritishDate(file.recordedAt)}</span>
</li>
