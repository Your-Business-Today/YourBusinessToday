<script lang="ts">
	import type { ConsultancyDiscipline } from '$lib/data/consultancyDisciplines';

	let { discipline }: { discipline: ConsultancyDiscipline } = $props();
</script>

<div class="grid gap-1 border-b border-hairline py-6 md:grid-cols-[20rem_1fr] md:gap-10">
	<h3 class="font-display text-lg font-medium">{discipline.name}</h3>
	<p class="max-w-prose text-chalk/70">{discipline.description}</p>
</div>
