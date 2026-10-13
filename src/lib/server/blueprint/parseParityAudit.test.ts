import { describe, expect, it } from 'vitest';
import { parseParityAudit } from './parseParityAudit';
import { parityGapsOf, toolsOf, toolsServingRoute } from '$lib/data/blueprint/mcpMap';

const audit = [
	'# Parity audit',
	'## 01-clients-properties.md',
	'| Story | Role | Named door | Implemented by | HTTP | Connector | Portal |',
	'|---|---|---|---|---|---|---|',
	'| US-01-01 | As the office, I want to record a client | C `UpsertClientGroup` | `UpsertClientGroup` | `domain/client-groups (POST)` | `upsert_client_group` | `/clients` list · `/clients/{id}` detail |',
	'| US-01-04 | As anyone inside, I want to list the clients | Q `ListClientGroups` | `ListClientGroups` | `domain/client-groups (GET)` | `list_client_groups` | `/clients` list · `/clients/{id}` detail |',
	'## 02-sales.md',
	'| US-02-12 | As the office, I want to export a breakdown | Q `ExportQuoteBreakdown` | — | — | — | Quote page · Export breakdown (CSV) |'
].join('\n');

describe('parseParityAudit', () => {
	const stories = parseParityAudit(audit);
	const map = { stories, skills: [], agents: [] };

	it('reads each story with its workflow, its connector tool and its pages', () => {
		expect(stories[0]).toEqual({
			id: 'US-01-01',
			workflow: '01-clients-properties',
			story: 'As the office, I want to record a client',
			toolNames: ['upsert_client_group'],
			routes: ['/clients', '/clients/{id}']
		});
	});

	it('gathers the tools and the screens they share with a person', () => {
		expect(toolsOf(map).map((tool) => tool.name)).toEqual(['upsert_client_group', 'list_client_groups']);
		expect(toolsServingRoute(map, '/clients/{Id}')).toEqual(['upsert_client_group', 'list_client_groups']);
	});

	it('names a story with no tool or no screen as a gap in parity', () => {
		expect(parityGapsOf(map).map((story) => story.id)).toEqual(['US-02-12']);
	});
});
