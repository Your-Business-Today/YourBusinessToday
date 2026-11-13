import { wrapLabel } from './labelWrap';
import { LabelSpacing, type Box, type LineMapGeometry } from './lineMapGeometry';
import type { StationLabel, StationPlace } from './lineMapLayout';
import { LabelSides, StationKinds, type MapStation } from './lineMapModel';
import { LabelFonts, type MeasureText } from './textMeasure';

export type LabelChoices = { lines: string[]; above: StationLabel; below: StationLabel };

export function labelChoices(station: MapStation, place: StationPlace, geometry: LineMapGeometry, measure: MeasureText): LabelChoices {
	const widest = geometry.pitch - LabelSpacing.labelGap;
	const { lines, width, height } = wrapLabel(station.name, LabelFonts.station, widest, measure);
	const isOutput = station.kind === StationKinds.output;
	const reach = isOutput ? LabelSpacing.outputReach : LabelSpacing.stationReach;
	const box: Box = { x: place.x - width / 2, y: 0, width, height };
	return {
		lines,
		above: { ...box, side: LabelSides.above, lines, y: place.top - reach - height },
		below: { ...box, side: LabelSides.below, lines, y: place.foot + reach }
	};
}

export function preferredOrder(station: MapStation, choices: LabelChoices): StationLabel[] {
	const prefersBelow = station.labelSide === LabelSides.below;
	return prefersBelow ? [choices.below, choices.above] : [choices.above, choices.below];
}
