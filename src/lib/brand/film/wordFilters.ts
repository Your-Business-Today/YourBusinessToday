import { placeWords, type PlacedDot, type PlacedLine } from './placeWords';
import { writeTextLine } from './recipeShell';
import type { FilmInk } from './filmInk';
import type { ShotWords } from './filmOrder';
import { wordBands, type FilmShape } from './filmFrame';

/** A shot's words as a recipe draws them: the lines it writes to files first, and the filters that draw them. */
export type DrawnWords = { fileLines: string[]; filters: string[] };

const fadedAlpha = '@0.8';

function dotFilter(dot: PlacedDot, ink: FilmInk): string {
	return `drawbox=x=${dot.x}:y=${dot.y}:w=${dot.size}:h=${dot.size}:color=0x${ink.accent}:t=fill`;
}

function lineFilter(line: PlacedLine, ink: FilmInk, textFile: string): string {
	const colour = `0x${ink.text}${line.isFaded ? fadedAlpha : ''}`;
	const place = `fontsize=${line.size}:fontcolor=${colour}:x=${line.x}:y=${line.y}`;
	return `drawtext=textfile=${textFile}:expansion=none:font='${ink.font}':${place}`;
}

/**
 * The shot's words drawn over its frame: each line written to its own file, so nothing it says is read as an ffmpeg
 * option, and drawn where the film's stage puts it.
 */
export function drawnWordsOf(words: ShotWords, shape: FilmShape, ink: FilmInk, fileStem: string): DrawnWords {
	const { lines, dot } = placeWords(words, wordBands[shape][words.wordsAt]);
	const textFiles = lines.map((_, index) => `${fileStem}-${index + 1}.txt`);
	const lineFilters = lines.map((line, index) => lineFilter(line, ink, textFiles[index]));
	const dotFilters = dot === null ? [] : [dotFilter(dot, ink)];
	const fileLines = lines.map((line, index) => writeTextLine(textFiles[index], line.text));
	return { fileLines, filters: [...dotFilters, ...lineFilters] };
}
