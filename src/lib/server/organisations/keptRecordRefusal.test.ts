import { describe, expect, it } from 'vitest';
import { keptRecordRefusal } from './keptRecordRefusal';

function refusalFrom(table: string) {
	return {
		message: `update or delete on table "organisations" violates foreign key constraint "${table}_organisation_id_fkey" on table "${table}"`,
		details: `Key (id)=(bb829b1b-c341-4690-871e-4881b4d69588) is still referenced from table "${table}".`
	};
}

describe('keptRecordRefusal', () => {
	it('names the books', () => {
		expect(keptRecordRefusal(refusalFrom('books_invoices'))).toContain('its books');
	});

	it('names the directors before the rest of the board', () => {
		expect(keptRecordRefusal(refusalFrom('boardroom_directors'))).toContain('the directors named to its board');
	});

	it("names what the brand has made", () => {
		expect(keptRecordRefusal(refusalFrom('brand_content_posts'))).toContain('its brand has made');
	});

	it('reads the table from the message when no details come with it', () => {
		const refusal = { message: refusalFrom('business_brains').message };
		expect(keptRecordRefusal(refusal)).toContain('Your Business Brain');
	});

	it('names a table it has no words for', () => {
		expect(keptRecordRefusal(refusalFrom('something_new'))).toContain('records in something_new');
	});

	it('still refuses when the database names no table', () => {
		expect(keptRecordRefusal({ message: 'violates foreign key constraint' })).toContain('so it was not deleted');
	});
});
