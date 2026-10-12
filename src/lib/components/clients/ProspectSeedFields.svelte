<script lang="ts">
	import type { ProspectSeed } from '$lib/data/prospectRules';

	let { company }: { company: ProspectSeed } = $props();
</script>

<input type="hidden" name="name" value={company.name} />
<input type="hidden" name="companyNumber" value={company.companyNumber} />
<input type="hidden" name="address" value={company.address} />
<input type="hidden" name="postcode" value={company.postcode} />
