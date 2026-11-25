import type { LegalSection } from '$lib/data/legalDocument';
import { termsOwnershipSections } from './termsOwnershipSections';
import { termsSoftwareSections } from './termsSoftwareSections';

/** The sections the acceptance page shows: those changed in the version in force. */
export const termsChangedSections: LegalSection[] = [...termsOwnershipSections, ...termsSoftwareSections];
