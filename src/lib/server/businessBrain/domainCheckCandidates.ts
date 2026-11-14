import { looseReferences } from './domainCheck/looseReferences';
import { misfiledPages } from './domainCheck/misfiledPages';
import { namingFaults } from './domainCheck/namingFaults';
import { nearDuplicatePages } from './domainCheck/nearDuplicatePages';
import { rulesInMeanings } from './domainCheck/rulesInMeanings';
import { thinPages } from './domainCheck/thinPages';
import { untouchedThings } from './domainCheck/untouchedThings';
import { wordClashes } from './domainCheck/wordClashes';
import type { DomainCheckCandidate } from '$lib/data/domainCheck';
import type { DomainCheckHeld } from './domainCheck/domainCheckHeld';

/** What may be wrong with a domain, for the person's Claude to judge: the near-duplicates and words used two ways first, the loose ends last. */
export function domainCheckCandidates(held: DomainCheckHeld): DomainCheckCandidate[] {
	const checks = [nearDuplicatePages, wordClashes, namingFaults, rulesInMeanings, misfiledPages, untouchedThings, thinPages, looseReferences];
	return checks.flatMap((check) => check(held));
}
