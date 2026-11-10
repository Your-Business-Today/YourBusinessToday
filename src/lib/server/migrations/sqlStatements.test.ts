import { describe, expect, it } from 'vitest';
import { splitStatements } from './sqlStatements';

const codeOf = (sql: string) => splitStatements(sql).map((statement) => statement.code);

describe('splitStatements', () => {
	it('splits at each semicolon and numbers each statement from the line it starts on', () => {
		const statements = splitStatements('create table a (id int);\n\n-- a note\nalter table a add column b text;');
		expect(statements.map((statement) => statement.code)).toEqual([
			'create table a (id int)',
			'alter table a add column b text'
		]);
		expect(statements.map((statement) => statement.line)).toEqual([1, 4]);
	});

	it('leaves comments out of the code and the text', () => {
		const [statement] = splitStatements('/* drop table a; */ select 1 -- delete from a;\n');
		expect(statement.code).toBe('select 1');
		expect(statement.text).toBe('select 1 -- delete from a;');
	});

	it('blanks a string, so a semicolon or a keyword inside it is not read as code', () => {
		expect(codeOf("comment on table a is 'we never drop table a; it''s kept';")).toEqual([
			"comment on table a is ''"
		]);
	});

	it('keeps a quoted identifier whole, even with a semicolon inside it', () => {
		expect(codeOf('create table "odd;name" (id int);')).toEqual(['create table "odd;name" (id int)']);
	});

	it('sets a dollar-quoted body aside with the line it starts on', () => {
		const [statement] = splitStatements('create function f() returns void as $body$\nbegin\n  delete from a;\nend\n$body$ language plpgsql;');
		expect(statement.code).toBe('create function f() returns void as $$ language plpgsql');
		expect(statement.bodies).toEqual([{ sql: '\nbegin\n  delete from a;\nend\n', line: 1 }]);
	});

	it('reads a statement with no closing semicolon at the end of the file', () => {
		expect(codeOf('select 1;\nselect 2')).toEqual(['select 1', 'select 2']);
	});
});
