import { labelRoles, type LabelRole } from './labelChoice';

/** The layer the labels sit in: over the brain and under its controls. */
export const labelLayerClasses = 'pointer-events-none absolute inset-0 overflow-hidden';

const sharedClasses = 'absolute top-0 left-0 whitespace-nowrap opacity-0 transition-opacity duration-300 will-change-transform';
const areaClasses = 'cursor-pointer rounded-full bg-night/75 px-2.5 py-1 font-display text-[11px] font-medium tracking-[0.18em] uppercase backdrop-blur-sm';

const roleClasses: Record<LabelRole, string> = {
	area: `${areaClasses} text-chalk/80 hover:text-chalk`,
	page: 'max-w-56 cursor-pointer truncate rounded-md bg-night/75 px-2 py-0.5 text-xs text-chalk/85 backdrop-blur-sm hover:text-go',
	opened: 'max-w-64 truncate rounded-md border border-signal/50 bg-night/85 px-2 py-0.5 font-display text-sm text-signal'
};

const coreAreaClasses = `${areaClasses} text-signal/90 hover:text-signal`;

/** The classes a label wears in its role; a core area's name is set in the signal colour, as its lobe is. */
export function labelClassesFor(role: LabelRole, isCoreArea: boolean): string {
	const isCoreAreaName = role === labelRoles.area && isCoreArea;
	return `${sharedClasses} ${isCoreAreaName ? coreAreaClasses : roleClasses[role]}`;
}
