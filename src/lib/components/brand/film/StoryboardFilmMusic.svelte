<script lang="ts">
	import { keepMediaAt } from './keepMediaAt';

	let { url, seconds, isPlaying }: { url: string; seconds: number; isPlaying: boolean } = $props();

	let audio: HTMLAudioElement | undefined = $state();
	const allowedDriftSeconds = 0.3;

	$effect(() => {
		if (audio === undefined) return;
		keepMediaAt(audio, seconds, isPlaying, allowedDriftSeconds);
	});
</script>

<audio bind:this={audio} src={url} preload="auto"></audio>
