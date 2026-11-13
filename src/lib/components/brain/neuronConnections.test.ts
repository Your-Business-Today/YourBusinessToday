import { describe, expect, it } from 'vitest';
import { connectionsOf } from './neuronConnections';

const page = (slug: string, title: string, kind: string) => ({ slug, title, summary: '', kind, contextSlug: null });
const pageIndex = [page('hoist', 'Travel hoist', 'entity'), page('berth', 'Berth', 'entity'), page('lifts', 'Lifting rules', 'rule')];

describe('what an opened page is connected to', () => {
	it('lists each page its neuron is drawn joined to, which way the link runs, by title', () => {
		const links = [
			{ fromSlug: 'hoist', toSlug: 'berth' },
			{ fromSlug: 'lifts', toSlug: 'hoist' },
			{ fromSlug: 'lifts', toSlug: 'berth' }
		];
		expect(connectionsOf('hoist', links, pageIndex)).toEqual([
			{ slug: 'berth', title: 'Berth', kindLabel: 'Entity', direction: 'pointsTo' },
			{ slug: 'lifts', title: 'Lifting rules', kindLabel: 'Rule', direction: 'pointedToBy' }
		]);
	});

	it('leaves out a link to a page the brain does not draw', () => {
		expect(connectionsOf('hoist', [{ fromSlug: 'hoist', toSlug: 'area-page' }], pageIndex)).toEqual([]);
	});
});
