<script lang="ts">
	import AddPersonForm from '$lib/components/people/AddPersonForm.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses, panelClasses } from '$lib/components/site/formStyles';

	type LeadKind = 'company' | 'person';

	const leadKinds = { company: 'company', person: 'person' } as const;

	const toggleClasses = 'rounded-full px-3 py-1 font-display text-xs transition';
	const chosenToggleClasses = `${toggleClasses} bg-chalk/10 text-chalk`;
	const availableToggleClasses = `${toggleClasses} text-chalk/50 hover:text-chalk`;

	let leadKind = $state<LeadKind>('company');
</script>

<div class={panelClasses}>
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h2 class="font-display text-lg">Add a lead</h2>
		<div class="flex gap-1 rounded-full border border-hairline p-1" role="group" aria-label="Kind of lead">
			<button
				type="button"
				class={leadKind === 'company' ? chosenToggleClasses : availableToggleClasses}
				onclick={() => (leadKind = 'company')}
			>
				Company
			</button>
			<button
				type="button"
				class={leadKind === 'person' ? chosenToggleClasses : availableToggleClasses}
				onclick={() => (leadKind = 'person')}
			>
				Person
			</button>
		</div>
	</div>
	{#if leadKind === leadKinds.person}
		<AddPersonForm action="/people?/addPerson" />
	{:else}
		<form method="POST" action="?/addLead" class="flex flex-col gap-4">
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<input name="name" required placeholder="Company" aria-label="Company" class={inputClasses} />
				<input name="website" placeholder="https://" aria-label="Website" class={inputClasses} />
				<input name="contactName" placeholder="First contact" aria-label="First contact name" class={inputClasses} />
				<input
					name="contactEmail"
					type="email"
					placeholder="Their email"
					aria-label="First contact email"
					class={inputClasses}
				/>
			</div>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<p class="text-xs text-chalk/50">
					Or let Claude do the reading:
					<a href="/clients/research" class="text-chalk/80 hover:text-signal">research a company</a>
					· <a href="/clients/prospect" class="text-chalk/80 hover:text-signal">search Companies House</a>
				</p>
				<SubmitButton>Add as a lead</SubmitButton>
			</div>
		</form>
	{/if}
</div>
