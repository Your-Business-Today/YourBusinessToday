/** The limits of the brand kit's own columns, read by the checks at every door that writes the kit. */
export const KitLimits = {
	summaryCharacters: 1000,
	rationaleCharacters: 1000,
	traitKeyCharacters: 120,
	traitLabelCharacters: 80,
	traitPurposeCharacters: 300,
	traitChoices: 20,
	traitChoiceCharacters: 60,
	decisionsPerCall: 50
} as const;
