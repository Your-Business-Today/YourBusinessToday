<script lang="ts">
	import AppMockup from './AppMockup.svelte';
	import AssistantPhoneMockup from './AssistantPhoneMockup.svelte';
</script>

<div class="relative hidden aspect-[5/4] md:block" aria-hidden="true">
	<div class="absolute top-0 left-0 flex w-[88%] flex-col items-center">
		<div class="w-full overflow-hidden rounded-2xl border-[6px] border-hairline bg-carriage shadow-2xl">
			<AppMockup />
		</div>
		<div class="h-10 w-[12%] bg-hairline/80"></div>
		<div class="h-2.5 w-[36%] rounded-full bg-hairline"></div>
	</div>
	<div class="absolute right-0 bottom-0 w-[40%]">
		<AssistantPhoneMockup />
	</div>
</div>
