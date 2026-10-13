import { describe, expect, it } from 'vitest';
import { parseWidgetNotation } from './widgetNotation';

const listPage =
	'Page{ SectionHeader{ SearchInput }, FilterChips, ?error is not null: Notice, RecordsTable{ (7) SortableColumnHeader }, ?page is { Total: > 0 }: Pagination }';

describe('parseWidgetNotation', () => {
	it('reads a widget with the widgets it holds, in order', () => {
		const page = parseWidgetNotation(listPage).children[0];
		expect(page.name).toBe('Page');
		expect(page.children.map((child) => child.name)).toEqual([
			'SectionHeader',
			'FilterChips',
			'Notice',
			'RecordsTable',
			'Pagination'
		]);
	});

	it('keeps a repeat and a condition on the widget they belong to', () => {
		const page = parseWidgetNotation(listPage).children[0];
		const table = page.children[3];
		expect(table.children[0].repeat).toBe('7');
		expect(page.children[4].condition).toBe('page is { Total: > 0 }');
	});

	it('reads side by side, a choice and a site part opened out', () => {
		const root = parseWidgetNotation('[ (2) FormField Button ], ( EmptyState | RecordsTable ), Rows=( Panel )');
		expect(root.children.map((child) => child.kind)).toEqual(['row', 'stack', 'widget']);
		expect(root.children[0].children.map((child) => child.name)).toEqual(['FormField', 'Button']);
		expect(root.children[1].children[0].kind).toBe('choice');
		expect(root.children[2].isPart).toBe(true);
		expect(root.children[2].children[0].name).toBe('Panel');
	});

	it('marks markup written by hand under the widget that should draw it', () => {
		const heading = parseWidgetNotation('JewelIcon, ⚠h1→PageHeader').children[1];
		expect(heading.name).toBe('PageHeader');
		expect(heading.isHandWritten).toBe(true);
	});
});
