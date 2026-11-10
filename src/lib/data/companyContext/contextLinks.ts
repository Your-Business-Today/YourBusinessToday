import type { CompanyContextVersion, ContextLink } from './companyContext';

/** The links that start or end at one part. */
export function linksTouching({ links }: CompanyContextVersion, partKey: string): ContextLink[] {
	return links.filter((link) => link.fromKey === partKey || link.toKey === partKey);
}

/** The parts at the other end of a part's links, and the roles and processes its steps join it to. */
export function partKeysLinkedTo(context: CompanyContextVersion, partKey: string): Set<string> {
	const linkedKeys = linksTouching(context, partKey).map((link) =>
		link.fromKey === partKey ? link.toKey : link.fromKey
	);
	const stepKeys = context.steps.flatMap((step) => {
		if (step.processKey === partKey) return step.roleKey === null ? [] : [step.roleKey];
		return step.roleKey === partKey ? [step.processKey] : [];
	});
	return new Set([...linkedKeys, ...stepKeys]);
}
