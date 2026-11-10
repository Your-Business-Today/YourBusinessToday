import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceFolder = 'src';
const thisTest = 'src/lib/server/callsNoAiModel.test.ts';
const forbiddenReferences = ['ANTHROPIC_API_KEY', 'api.anthropic.com', '@anthropic-ai/'];

function sourceFilesUnder(folder: string): string[] {
	return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
		const path = join(folder, entry.name);
		if (entry.isDirectory()) return sourceFilesUnder(path);
		return [relative('.', path)];
	});
}

function referencesIn(path: string): string[] {
	const source = readFileSync(path, 'utf8');
	return forbiddenReferences
		.filter((reference) => source.includes(reference))
		.map((reference) => `${path} mentions ${reference}`);
}

describe('Your Business Today calls no AI model itself', () => {
	it('has no source file that reads the Anthropic key or calls the Anthropic API', () => {
		const sourceFiles = sourceFilesUnder(sourceFolder).filter((path) => path !== thisTest);
		expect(sourceFiles.flatMap(referencesIn)).toEqual([]);
	});
});
