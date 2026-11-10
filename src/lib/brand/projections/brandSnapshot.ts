import { brandBriefOf } from './brandBrief';
import { cssVariablesOf } from './cssVariables';
import type { BrandSnapshot } from '../content/contentPiece';
import type { ResolvedBrand } from '../resolution/resolvedBrand';

/** The brand as it holds for one medium now, kept on a piece written for that medium. */
export function brandSnapshotOf(organisationName: string, resolved: ResolvedBrand): BrandSnapshot {
	return { brief: brandBriefOf(organisationName, resolved), variables: cssVariablesOf(resolved) };
}
