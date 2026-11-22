<script lang="ts">
	import { chatRoomPath } from '$lib/data/chat/chatPaths';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { movedAwaySentence, type MovedAwayMarker } from '$lib/data/chat/chatRoomFlow';

	let { organisationId, marker }: { organisationId: string; marker: MovedAwayMarker } = $props();

	const sentence = $derived(movedAwaySentence(marker));
</script>

<li class="flex flex-wrap items-center justify-center gap-x-1.5 px-4 py-2 text-xs text-chalk-subtle">
	<a href={chatRoomPath(organisationId, marker.toRoomId)} class="font-display text-chalk-muted underline-offset-2 hover:text-go hover:underline">
		{sentence}
	</a>
	<time datetime={marker.movedAt}>· {formatBritishDateTime(marker.movedAt)}</time>
</li>
