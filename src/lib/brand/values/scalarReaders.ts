import { ValueLimits } from './valueLimits';
import { accepted, refused, type ValueReading } from './valueReading';

const colourPattern = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const lengthPattern = /^(?:0|\d+(?:\.\d+)?(?:px|rem|em|%))$/;
const durationPattern = /^\d+(?:\.\d+)?(?:ms|s)$/;
const ratioPattern = /^\d+:\d+$/;
const easingKeywords = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];
const cubicBezierPattern = /^cubic-bezier\(\s*-?[\d.]+\s*(?:,\s*-?[\d.]+\s*){3}\)$/;
const fontFamilyForbiddenCharacters = /[;{}<>]/;

export function readColour(text: string): ValueReading {
	if (!colourPattern.test(text)) return refused('a colour is a hex value such as #ff5a36');
	return accepted(text.toLowerCase());
}

export function readLength(text: string): ValueReading {
	if (!lengthPattern.test(text)) return refused('a length is 0 or a number in px, rem, em or %');
	return accepted(text);
}

export function readDuration(text: string): ValueReading {
	if (!durationPattern.test(text)) return refused('a duration is a number in ms or s, such as 250ms');
	return accepted(text);
}

export function readEasing(text: string): ValueReading {
	if (easingKeywords.includes(text) || cubicBezierPattern.test(text)) return accepted(text);
	return refused(`an easing is one of ${easingKeywords.join(', ')} or a cubic-bezier(…)`);
}

export function readRatio(text: string): ValueReading {
	if (!ratioPattern.test(text)) return refused('a ratio is two whole numbers such as 9:16');
	return accepted(text);
}

export function readFontFamily(text: string): ValueReading {
	if (text === '') return refused('a font family needs a name');
	if (text.length > ValueLimits.fontFamilyCharacters) {
		return refused(`a font family is at most ${ValueLimits.fontFamilyCharacters} characters`);
	}
	if (fontFamilyForbiddenCharacters.test(text)) return refused('a font family is a name, not code');
	return accepted(text);
}

export function readFontWeight(text: string): ValueReading {
	const weight = Number(text);
	const isInRange =
		weight >= ValueLimits.lightestFontWeight && weight <= ValueLimits.heaviestFontWeight;
	if (isInRange && weight % ValueLimits.fontWeightStep === 0) return accepted(weight);
	return refused('a font weight is a hundred from 100 to 900');
}

export function readNumber(text: string): ValueReading {
	const number = Number(text);
	if (text === '' || !Number.isFinite(number)) return refused('this needs a number');
	return accepted(number);
}

export function readPhrase(text: string): ValueReading {
	if (text === '') return refused('this needs some words');
	if (text.length > ValueLimits.phraseCharacters) {
		return refused(`keep it to ${ValueLimits.phraseCharacters} characters`);
	}
	return accepted(text);
}

export function readChoice(text: string, choices: string[]): ValueReading {
	if (choices.includes(text)) return accepted(text);
	return refused(`choose one of ${choices.join(', ')}`);
}
