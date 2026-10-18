<script lang="ts">
	import { elapsedPhrase } from '$lib/data/elapsedTime';
	import { formatBritishDate, formatBritishTime } from '$lib/data/britishDate';

	let { createdAt }: { createdAt: string } = $props();
</script>

<time
	datetime={createdAt}
	title={`Raised ${elapsedPhrase(createdAt)}`}
	class="font-display text-xs whitespace-nowrap text-chalk/45"
>
	Raised {formatBritishDate(createdAt)}, {formatBritishTime(createdAt)}
</time>
