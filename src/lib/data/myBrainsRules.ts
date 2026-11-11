import type { BusinessBrainPartKind } from './businessBrainRules';

/** How many pages of each brain a search across them shows, best match first. */
export const myBrainsLimits = { mostPagesShownPerBrain: 3 } as const;

/** A page a brain holds that matched the words, as a search across brains shows it. */
export type BrainPageFound = { pageId: string; title: string; partKind: BusinessBrainPartKind; kind: string; excerpt: string };

/** One brain a search went through: what it is called, what it is for, how to read on in it and the pages that matched. */
export type BrainSearched = { name: string; purpose: string; readOnWith: string; pagesFound: BrainPageFound[] };

/** Which brains to search: every one the person reaches, or those of one organisation. */
export type BrainSearchScope = { organisationId: string | null; searchText: string };
