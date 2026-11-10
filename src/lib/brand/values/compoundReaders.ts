import { isActionStance, actionStances } from './traitValue';
import { ValueLimits } from './valueLimits';
import { weekdayNamed, weekdays, type Weekday } from './weekdays';

const weekdayNames = weekdays.join(', ');
import { accepted, refused, type ValueReading } from './valueReading';

export function readPhraseList(raw: unknown): ValueReading {
	const items = listItems(raw);
	if (items === null) return refused('this needs a list of words or phrases');
	if (items.length === 0) return refused('this needs at least one entry');
	if (items.length > ValueLimits.listItems) {
		return refused(`keep the list to ${ValueLimits.listItems} entries`);
	}
	const overlong = items.find((item) => item.length > ValueLimits.listItemCharacters);
	if (overlong !== undefined) {
		return refused(`keep each entry to ${ValueLimits.listItemCharacters} characters`);
	}
	return accepted(items);
}

export function readActionRule(raw: unknown): ValueReading {
	if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
		return refused('an action rule is a stance and guidance');
	}
	const rule = raw as Record<string, unknown>;
	if (!isActionStance(rule.stance)) {
		return refused(`the stance is one of ${actionStances.join(', ')}`);
	}
	const guidance = String(rule.guidance ?? '').trim();
	if (guidance.length > ValueLimits.guidanceCharacters) {
		return refused(`keep the guidance to ${ValueLimits.guidanceCharacters} characters`);
	}
	return accepted({ stance: rule.stance, guidance });
}

export function readWeekdays(raw: unknown): ValueReading {
	const items = listItems(raw);
	if (items === null || items.length === 0) return refused('this needs a list of days of the week');
	const named = items.map((item) => ({ item, weekday: weekdayNamed(item) }));
	const unknown = named.find(({ weekday }) => weekday === null);
	if (unknown !== undefined) return refused(`“${unknown.item}” is not a day of the week: give ${weekdayNames}`);
	const days = named.map(({ weekday }) => weekday as Weekday);
	const repeated = days.find((day, index) => days.indexOf(day) !== index);
	if (repeated !== undefined) return refused(`${repeated} is given twice`);
	return accepted(weekdays.filter((weekday) => days.includes(weekday)));
}

function listItems(raw: unknown): string[] | null {
	if (typeof raw === 'string') return linesOf(raw);
	if (!Array.isArray(raw)) return null;
	if (!raw.every((item) => typeof item === 'string')) return null;
	return withoutBlanks(raw);
}

function linesOf(text: string): string[] {
	const lines = text.split('\n');
	return withoutBlanks(lines);
}

function withoutBlanks(items: string[]): string[] {
	return items.map((item) => item.trim()).filter((item) => item !== '');
}
