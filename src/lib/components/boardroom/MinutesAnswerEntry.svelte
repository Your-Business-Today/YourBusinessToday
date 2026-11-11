<script lang="ts">
	import DirectorAnswerEntry from './DirectorAnswerEntry.svelte';
	import { minutesAnswerBadges } from './minutesBadges';
	import type { MinutesAnswerView } from '$lib/data/boardMinutesViews';

	let { answer }: { answer: MinutesAnswerView } = $props();

	const badge = $derived(minutesAnswerBadges[answer.answer]);
</script>

<DirectorAnswerEntry directorName={answer.directorName} {badge} when={answer.when} words={answer.changeWords} />
