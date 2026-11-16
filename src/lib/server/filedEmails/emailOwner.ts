import type { ClientStage } from '$lib/data/clientLifecycle';

/** A client or lead an email may be filed under: enough to name it and to file under it straight away. */
export type EmailCompany = { id: string; name: string; stage: ClientStage };

/** Who one address of an email belongs to, as far as the register knows. */
export type EmailOwner =
	| { address: string; kind: 'us' }
	| { address: string; kind: 'person'; personId: string; personName: string; companies: EmailCompany[] }
	| { address: string; kind: 'website'; domain: string; companies: EmailCompany[] }
	| { address: string; kind: 'nobody' };

export const emailOwnerKinds = { us: 'us', person: 'person', website: 'website', nobody: 'nobody' } as const;
