export type RolePattern = { role: string; pattern: RegExp };

/**
 * Roles whose work our software takes over or multiplies: a company advertising
 * one has costed the pain at a salary.
 */
export const rolesWeReplaceOrAmplify: RolePattern[] = [
	{ role: 'Quantity surveyor', pattern: /\bquantity\s+surveyor/i },
	{ role: 'Contracts manager', pattern: /\bcontracts?\s+manager/i },
	{ role: 'Project coordinator', pattern: /\bproject\s+co-?ordinator/i },
	{ role: 'Operations manager', pattern: /\boperations\s+manager/i },
	{ role: 'Systems role', pattern: /\bsystems?\b/i }
];

export function matchedRoleFor(title: string): string | null {
	const match = rolesWeReplaceOrAmplify.find((candidate) => candidate.pattern.test(title));
	return match?.role ?? null;
}
