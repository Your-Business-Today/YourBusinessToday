/** An area of the business the brain gathers its pages around: one lobe of the drawn brain. */
export type BrainContext = {
	slug: string;
	name: string;
	summary: string;
	isCoreDomain: boolean;
};

/** One page of the brain as the drawn brain shows it: one neuron, in its area's lobe when it has one. */
export type BrainPageSummary = {
	slug: string;
	title: string;
	summary: string;
	kind: string;
	contextSlug: string | null;
};

/** One page pointing at another: one synapse between their neurons. */
export type BrainPageLink = { fromSlug: string; toSlug: string };
