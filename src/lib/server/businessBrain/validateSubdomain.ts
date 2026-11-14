import { subdomainKinds, type SubdomainKind } from '$lib/data/businessBrainDomain';
import { everySubdomainKind } from '$lib/data/areaRelationshipFacts';
import { trimmedText } from '$lib/data/trimmedText';
import type { PlainObject } from '$lib/data/plainObject';

export const subdomainRefusal = `The subdomain says what part the context plays, one of ${everySubdomainKind.join(', ')}.`;

export const coreMarkRefusal = `isCoreDomain and a subdomain of ${subdomainKinds.core} go together; a context marked as the core domain is no other kind.`;

/** The part a context plays, its core mark and its subdomain agreeing, or a sentence saying why they do not. */
export function validateSubdomain(entry: PlainObject): { isCoreDomain: boolean; subdomain: SubdomainKind | null } | string {
	const given = trimmedText(entry.subdomain);
	const isMarkedCore = entry.isCoreDomain === true;
	if (given === '') return { isCoreDomain: isMarkedCore, subdomain: isMarkedCore ? subdomainKinds.core : null };
	if (!isSubdomainKind(given)) return subdomainRefusal;
	const isCoreDomain = given === subdomainKinds.core;
	const isMarkDisagreeing = isMarkedCore && !isCoreDomain;
	return isMarkDisagreeing ? coreMarkRefusal : { isCoreDomain, subdomain: given };
}

function isSubdomainKind(given: string): given is SubdomainKind {
	return (everySubdomainKind as string[]).includes(given);
}
