/** Letters the standard fonts lack, written as their nearest plain letters. */
const standIns: Record<string, string> = { '\t': ' ', Ł: 'L', ł: 'l', '№': 'No.', Đ: 'D', đ: 'd', Ħ: 'H', ħ: 'h', ı: 'i', '−': '-' };

const unknownCharacter = '?';

const accents = /\p{Mark}/gu;

/**
 * The text with every character the font cannot draw written as its nearest plain letter, its letter without the
 * accent, or a question mark, so no name or description can stop an invoice from being drawn.
 */
export function drawableTextOf(text: string, drawable: ReadonlySet<number>): string {
	return Array.from(text, (character) => drawableCharacterOf(character, drawable)).join('');
}

function drawableCharacterOf(character: string, drawable: ReadonlySet<number>): string {
	if (canDraw(character, drawable)) return character;
	const standIn = standIns[character] ?? character.normalize('NFD').replace(accents, '');
	if (canDraw(standIn, drawable)) return standIn;
	return unknownCharacter;
}

function canDraw(text: string, drawable: ReadonlySet<number>): boolean {
	return Array.from(text).every((character) => drawable.has(character.codePointAt(0) ?? 0));
}
