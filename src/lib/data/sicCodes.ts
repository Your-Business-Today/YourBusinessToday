const sicCodeShape = /^\d{5}$/;

/** The codes typed into a field, however they were separated. */
export function readSicCodeList(text: string): string[] {
	return text
		.split(/[,\s]+/)
		.map((code) => code.trim())
		.filter((code) => code !== '');
}

export function isSicCode(code: string): boolean {
	return sicCodeShape.test(code);
}
