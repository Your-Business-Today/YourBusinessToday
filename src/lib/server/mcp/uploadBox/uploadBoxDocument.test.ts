import { describe, expect, it } from 'vitest';
import boxMarkup from '$lib/uploadBox/uploadBox.html?raw';
import boxStyles from '$lib/uploadBox/uploadBox.css?raw';
import { asOneScript, uploadBoxDocument, uploadBoxModules } from './uploadBoxDocument';
import { uploadBoxStepNames, uploadBoxStepToolName } from './uploadBoxNames';

const longestPartLineCount = 100;
const declaredName = /^(?:export )?(?:async )?(?:function|const|let) (\w+)/gm;
const addressElsewhere = /(?:src|href)=["']https?:/;
const hexColour = /#[0-9a-fA-F]{3,8}\b/;

function lineCountOf(part: string): number {
	return part.trimEnd().split('\n').length;
}

function namesDeclaredIn(module: string): string[] {
	return [...module.matchAll(declaredName)].map((match) => match[1]);
}

describe('the upload box page', () => {
	const script = asOneScript(uploadBoxModules);

	it('is one page that loads nothing from anywhere else', () => {
		expect(uploadBoxDocument).not.toMatch(addressElsewhere);
		expect(uploadBoxDocument).not.toContain('/*upload-box-');
		expect(uploadBoxDocument).toContain(boxStyles);
		expect(uploadBoxDocument).toContain('ui/initialize');
	});

	it('joins its modules into one script with no import or export left', () => {
		expect(script).not.toMatch(/^\s*import\b/m);
		expect(script).not.toMatch(/^\s*export\b/m);
		expect(() => new Function(script)).not.toThrow();
	});

	it('declares each name once, since the modules share one scope', () => {
		const names = uploadBoxModules.flatMap(namesDeclaredIn);
		const repeatedNames = names.filter((name, index) => names.indexOf(name) !== index);
		expect(repeatedNames).toEqual([]);
	});

	it('calls the tool the connector lists for it, by the steps the connector takes', () => {
		expect(script).toContain(`'${uploadBoxStepToolName}'`);
		for (const stepName of uploadBoxStepNames) {
			expect(script).toContain(`${stepName}: '${stepName}'`);
		}
	});

	it('takes its colours from the host, with none of its own', () => {
		expect(boxStyles).not.toMatch(hexColour);
		expect(boxMarkup).not.toContain('style="');
	});

	it('keeps every part within the length the rest of the code is held to', () => {
		for (const part of [...uploadBoxModules, boxStyles, boxMarkup]) {
			expect(lineCountOf(part)).toBeLessThanOrEqual(longestPartLineCount);
		}
	});
});
