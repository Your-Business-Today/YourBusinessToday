<script lang="ts">
	let { titles }: { titles: string[] } = $props();
</script>

<div class="border-t border-hairline px-4 py-4 text-sm text-chalk-subtle md:px-6">
	<p class="font-medium">Withdrawn before the meeting</p>
	<ul class="mt-1 list-disc pl-5">
		{#each titles as title, index (index)}
			<li>{title}</li>
		{/each}
	</ul>
</div>
