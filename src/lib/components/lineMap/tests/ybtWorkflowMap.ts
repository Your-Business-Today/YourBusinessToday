import type { LineMapModel, MapStation } from '../layout/lineMapModel';

const ours = (name: string, kind: MapStation['kind'] = 'task'): MapStation => ({ name, kind, state: 'ours' });
const elsewhere = (name: string, kind: MapStation['kind'] = 'task'): MapStation => ({ name, kind, state: 'elsewhere' });

const stations: Record<string, MapStation> = {
	'prospect-a-patch': ours('Prospect a patch'),
	'make-the-introduction': elsewhere('Make the introduction'),
	'hold-the-first-meeting': elsewhere('Hold the first meeting'),
	'log-the-conversation': ours('Log the conversation'),
	'agree-the-offer': elsewhere('Agree the offer', 'output'),
	'sign-the-contract-stack': elsewhere('Sign the contract stack', 'output'),
	'keep-the-company-compliant': elsewhere('Keep the company compliant', 'output'),
	'set-the-client-up': ours('Set the client up'),
	'invite-the-clients-people': ours("Invite the client's people"),
	'map-the-clients-workflows': ours("Map the client's workflows"),
	'raise-the-services': ours('Raise the services'),
	'size-the-work': ours('Size the work'),
	'connect-claude': ours('Connect Claude'),
	'check-the-workflow-map': ours('Check the workflow map'),
	'ask-for-a-feature': ours('Ask for a feature'),
	'use-the-release': elsewhere('Use the release'),
	'build-the-task': ours('Build the task'),
	'merge-to-staging': ours('Merge to staging'),
	'deploy-at-the-window': ours('Deploy at the window', 'output'),
	'run-the-hosting': elsewhere('Run the hosting'),
	'set-the-dns': elsewhere('Set the DNS'),
	'register-the-tenant-apps': elsewhere('Register the tenant apps'),
	'invoice-the-subscription': { name: 'Invoice the subscription', kind: 'output', state: 'planned' },
	'keep-the-books': elsewhere('Keep the books', 'output')
};

const lines: LineMapModel['lines'] = [
	{ id: 'introducer', name: 'Introducer', colour: 'peach', stops: ['prospect-a-patch', 'make-the-introduction'] },
	{ id: 'account-lead', name: 'Account lead', colour: 'lilac', stops: ['hold-the-first-meeting', 'log-the-conversation', 'agree-the-offer'] },
	{ id: 'director', name: 'Director', colour: 'sky', stops: ['sign-the-contract-stack', 'keep-the-company-compliant'] },
	{ id: 'administrator', name: 'Administrator', colour: 'teal', stops: ['set-the-client-up', 'invite-the-clients-people'] },
	{ id: 'solution-designer', name: 'Solution designer', colour: 'rose', stops: ['map-the-clients-workflows', 'raise-the-services', 'size-the-work'] },
	{ id: 'client', name: "Client's staff", colour: 'daylight', stops: ['connect-claude', 'check-the-workflow-map', 'ask-for-a-feature', 'use-the-release'] },
	{ id: 'build-pipeline', name: 'Build pipeline', colour: 'peach', stops: ['build-the-task', 'merge-to-staging'] },
	{ id: 'release-manager', name: 'Release manager', colour: 'lilac', stops: ['deploy-at-the-window', 'run-the-hosting'] },
	{ id: 'domain-and-tenant-admin', name: 'Domain and tenant admin', colour: 'sky', stops: ['set-the-dns', 'register-the-tenant-apps'] },
	{ id: 'billing', name: 'Billing', colour: 'teal', stops: ['invoice-the-subscription', 'keep-the-books'] }
];

const handovers: LineMapModel['handovers'] = [
	{ from: 'make-the-introduction', to: 'hold-the-first-meeting' },
	{ from: 'agree-the-offer', to: 'sign-the-contract-stack' },
	{ from: 'sign-the-contract-stack', to: 'set-the-client-up' },
	{ from: 'sign-the-contract-stack', to: 'invoice-the-subscription' },
	{ from: 'invite-the-clients-people', to: 'connect-claude' },
	{ from: 'set-the-client-up', to: 'set-the-dns' },
	{ from: 'set-the-client-up', to: 'register-the-tenant-apps' },
	{ from: 'connect-claude', to: 'map-the-clients-workflows' },
	{ from: 'map-the-clients-workflows', to: 'check-the-workflow-map' },
	{ from: 'check-the-workflow-map', to: 'raise-the-services' },
	{ from: 'ask-for-a-feature', to: 'size-the-work' },
	{ from: 'size-the-work', to: 'build-the-task' },
	{ from: 'merge-to-staging', to: 'deploy-at-the-window' },
	{ from: 'deploy-at-the-window', to: 'use-the-release' }
];

/** Your Business Today's own After map, version 1, as filed on 13 Nov 2026: ten roles handing the work on. */
export const ybtMapAfter: LineMapModel = { lines, stations, handovers };
