import { isSameStation, lineOfStation, lineWithKey, lineWords, stationWords, type AmendingMap, type AmendingStep } from './amendingMap';
import type { MapLine } from './workflowMap';
import type { LinePut, StationPut } from './workflowMapAmendment';

/** Puts each line named: a new one goes at the end of the map with no stations yet; one the map holds takes the new name and kind. */
export function putLines(map: AmendingMap, lines: LinePut[]): AmendingStep {
	for (const put of lines) {
		const line = lineWithKey(map, put.key);
		if (line === undefined) {
			map.lines.push({ ...put, stations: [] });
			map.added.push(lineWords(put.key));
			continue;
		}
		const isUnchanged = line.name === put.name && line.kind === put.kind;
		if (isUnchanged) continue;
		Object.assign(line, put);
		map.replaced.push(lineWords(put.key));
	}
	return null;
}

/** Puts each station named, in the order given, so a station can follow one put before it in the same amendment. */
export function putStations(map: AmendingMap, stations: StationPut[]): AmendingStep {
	for (const put of stations) {
		const refusal = putStation(map, put);
		if (refusal !== null) return refusal;
	}
	return null;
}

function putStation(map: AmendingMap, { station, lineKey, afterKey }: StationPut): AmendingStep {
	const label = stationWords(station.key);
	const currentLine = lineOfStation(map, station.key);
	const targetLineKey = lineKey ?? currentLine?.key;
	if (targetLineKey === undefined)
		return {
			refusal: `The ${label} is new: give the lineKey of the line it goes on.`
		};
	const targetLine = lineWithKey(map, targetLineKey);
	if (targetLine === undefined)
		return {
			refusal: `The ${label} names lineKey "${targetLineKey}", which is not a line on this map.`
		};
	const isAfterItself = afterKey === station.key;
	const isAfterOnTheLine = afterKey === null || targetLine.stations.some((onLine) => onLine.key === afterKey);
	if (isAfterItself || !isAfterOnTheLine)
		return {
			refusal: `The ${label} follows "${afterKey}", which is not another station on the ${lineWords(targetLineKey)}.`
		};
	if (currentLine === undefined) {
		placeStation(targetLine, station, afterKey);
		map.added.push(`${label} on ${lineWords(targetLineKey)}`);
		return null;
	}
	return replaceStation(map, { station, lineKey: targetLineKey, afterKey }, currentLine, targetLine);
}

function replaceStation(map: AmendingMap, put: StationPut, currentLine: MapLine, targetLine: MapLine): AmendingStep {
	const { station, afterKey } = put;
	const label = stationWords(station.key);
	const position = currentLine.stations.findIndex((onLine) => onLine.key === station.key);
	const isSameContents = isSameStation(currentLine.stations[position], station);
	if (!isSameContents) map.replaced.push(label);
	const staysPut = currentLine === targetLine && afterKey === null;
	if (staysPut) {
		currentLine.stations[position] = station;
		return null;
	}
	currentLine.stations.splice(position, 1);
	placeStation(targetLine, station, afterKey);
	map.moved.push(`${label} to ${lineWords(targetLine.key)}`);
	return null;
}

function placeStation(line: MapLine, station: StationPut['station'], afterKey: string | null): void {
	if (afterKey === null) {
		line.stations.push(station);
		return;
	}
	const followed = line.stations.findIndex((onLine) => onLine.key === afterKey);
	line.stations.splice(followed + 1, 0, station);
}
