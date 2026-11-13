import { leadsLink, clientsLink } from '$lib/components/site/siteNavigation';
import type { ClientStage } from './clientLifecycle';

/**
 * One of the two registers a company sits on: Leads until it signs, Clients once it has. The stage alone decides
 * which, so a record moves between them by moving its stage and nothing is copied.
 */
export type SalesRegister = {
	path: string;
	title: string;
	description: string;
	stages: ClientStage[];
};

export const leadsRegister: SalesRegister = {
	path: leadsLink.href,
	title: leadsLink.label,
	description: 'Everyone we hope to work for, until they sign.',
	stages: ['lead', 'prospect', 'lost']
};

export const clientsRegister: SalesRegister = {
	path: clientsLink.href,
	title: clientsLink.label,
	description: 'Everyone who has signed, and works with us now or has before.',
	stages: ['client', 'dormant']
};

/** The register a record at this stage shows on. */
export function registerOfStage(stage: ClientStage): SalesRegister {
	if (clientsRegister.stages.includes(stage)) return clientsRegister;
	return leadsRegister;
}

/** The stage a register's tab asks for, or null for all of them; a stage of the other register reads as all. */
export function stageOnRegister(register: SalesRegister, requested: string | null): ClientStage | null {
	return register.stages.find((stage) => stage === requested) ?? null;
}

/** The address of a company's own page, under the register its stage puts it on: /leads/<id> or /clients/<id>. */
export function companyPagePath(company: { id: string; stage: ClientStage }): string {
	return `${registerOfStage(company.stage).path}/${company.id}`;
}

/** The registers' addresses without their slash, as a company page's first segment names one. */
export const salesRegisterSegments = [leadsRegister, clientsRegister].map(({ path }) => path.slice(1));
