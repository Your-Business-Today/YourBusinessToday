import { badgeText } from '$lib/data/lifecycleBadge';
import { buildStageMeanings } from '$lib/data/buildStage';
import { cardCountPhrase, workKindLabels, type ScrumBoard, type ScrumCard, type ScrumColumn } from '$lib/data/scrumBoard';
import { velocityWeekCount, weekLabelOf, type Velocity } from '$lib/data/weeklyVelocity';

const boardHeading =
	'Development by build stage — where each bug, feature and infrastructure task stands, as the Board on the project page shows it, bugs first in each column:';

/** The Development side as its scrum board shows it: each column with its count and points, then the weekly velocity. */
export function describeScrumBoard(board: ScrumBoard): string {
	return [boardHeading, ...board.columns.flatMap(columnLines), '', ...velocityLines(board.velocity)].join('\n');
}

function columnLines(column: ScrumColumn): string[] {
	const heading = `${column.label} (${buildStageMeanings[column.stage]}) — ${cardCountPhrase(column.cardCount)}, ${column.totalPoints} points`;
	if (column.cardCount === 0) return [`${heading}.`];
	return [`${heading}:`, ...column.cards.map(cardLine)];
}

function cardLine(card: ScrumCard): string {
	const facts = [workKindLabels[card.workKind].toLowerCase(), `${card.storyPoints} points`, ...optionalFacts(card)];
	return `- ${card.title} — ${facts.join(', ')} (id: ${card.id})`;
}

function optionalFacts(card: ScrumCard): string[] {
	const modelFact = card.modelLabel === null ? [] : [`needs ${card.modelLabel}`];
	const lifecycleFact = card.lifecycle === null ? [] : [badgeText(card.lifecycle)];
	const pullRequestFact = card.pullRequestUrl === '' ? [] : [`pull request ${card.pullRequestUrl}`];
	return [...modelFact, ...lifecycleFact, ...pullRequestFact];
}

function velocityLines(velocity: Velocity): string[] {
	const weeks = velocity.weeks.map((week) => `week of ${weekLabelOf(week.weekStart)}: ${week.points}`);
	return [
		`Velocity — story points that went live in each of the last ${velocityWeekCount} weeks, Monday to Sunday UK time, by the deploys read_deploy_history lists, this week last:`,
		`${weeks.join('; ')}.`,
		`Average: ${velocity.averagePoints} points a week.`
	];
}
