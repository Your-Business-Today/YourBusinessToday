import * as scalar from './scalarReaders';
import { readActionRule, readPhraseList } from './compoundReaders';
import { isTraitReference } from './traitReference';
import { accepted, refused, type ValueReading } from './valueReading';
import type { TraitKind } from './traitValue';

export type ValueShape = { kind: TraitKind; choices?: string[] };

type TextReader = (text: string, shape: ValueShape) => ValueReading;

const textReaders: Partial<Record<TraitKind, TextReader>> = {
	colour: scalar.readColour,
	length: scalar.readLength,
	duration: scalar.readDuration,
	easing: scalar.readEasing,
	ratio: scalar.readRatio,
	fontFamily: scalar.readFontFamily,
	fontWeight: scalar.readFontWeight,
	number: scalar.readNumber,
	phrase: scalar.readPhrase,
	choice: (text, shape) => scalar.readChoice(text, shape.choices ?? [])
};

export function readTraitValue(shape: ValueShape, raw: unknown): ValueReading {
	if (shape.kind === 'phraseList') return readPhraseList(raw);
	if (shape.kind === 'actionRule') return readActionRule(raw);
	if (isTraitReference(raw)) return accepted(String(raw));
	const readText = textReaders[shape.kind];
	if (readText === undefined) return refused(`nothing reads a ${shape.kind}`);
	if (typeof raw !== 'string' && typeof raw !== 'number') return refused('this needs a single value');
	return readText(String(raw).trim(), shape);
}
