import { depthOf } from './mediumPaths';
import { mediums } from './mediumCatalogue';

const indent = '   ';

export type MediumOption = { path: string; label: string };

export const mediumOptions: MediumOption[] = mediums.map((medium) => ({
	path: medium.path,
	label: `${indent.repeat(depthOf(medium.path))}${medium.label}`
}));
