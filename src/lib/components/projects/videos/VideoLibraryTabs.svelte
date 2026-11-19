<script lang="ts">
	import TabStrip, { type Tab } from '$lib/components/workspace/TabStrip.svelte';
	import { videoLibraryHref } from './videoLibraryAddress';
	import { videoLibraryNames, videoLibraryWords, type VideoLibrary } from '$lib/projectVideos/videoLibraries';

	let { projectId, library }: { projectId: string; library: VideoLibrary } = $props();

	const tabs: Tab[] = $derived(
		videoLibraryNames.map((name) => ({ key: name, label: videoLibraryWords[name].name, count: null, href: videoLibraryHref(projectId, name) }))
	);
</script>

<TabStrip {tabs} selectedKey={library} />
