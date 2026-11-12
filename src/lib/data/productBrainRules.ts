import type { BusinessBrainPartKind } from './businessBrainRules';

/** A product of an organisation, whose brain is the parts of the organisation's brain tied to it. */
export type ProductBrainPlace = { organisationId: string; projectId: string };

/** Who is tying or untying parts on which product. */
export type ProductBrainTying = ProductBrainPlace & { accountId: string };

/** What a manager changes on a product's brain: parts of the organisation's brain to tie and to untie. */
export type ProductBrainChange = { addParts: BusinessBrainPartKind[]; removeParts: BusinessBrainPartKind[] };
