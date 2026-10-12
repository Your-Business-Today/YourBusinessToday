<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import { searchSourceLabels } from '$lib/data/searchSources';
	import type { RecordedSectorSearch } from '$lib/server/sectors/sectorSearchRecord';

	let { search, searcherName }: { search: RecordedSectorSearch; searcherName: string } = $props();
</script>

<li class="flex flex-col gap-0.5 py-2 text-sm">
	<p class="text-chalk/80">
		{searcherName} searched {searchSourceLabels[search.source]} on {formatBritishDate(search.searchedAt)}: {search.foundCount} found
	</p>
	<p class="text-chalk/60">{search.summary}</p>
</li>
