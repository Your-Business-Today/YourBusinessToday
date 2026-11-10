import { audienceActions } from '../actions/audienceActions';
import { brandActions } from '../actions/brandActions';
import type { BrandAction } from '../actions/brandAction';
import type { FacetKey } from '../facets';
import type { TraitDefinition } from './traitDefinition';

function actionTrait(facet: FacetKey, action: BrandAction): TraitDefinition {
	return {
		key: `${facet}.${action.key}`,
		facet,
		kind: 'actionRule',
		label: action.label,
		purpose: action.description,
		actionKey: action.key
	};
}

export const behaviourTraits = brandActions.map((action) => actionTrait('behaviour', action));

export const responseTraits = audienceActions.map((action) => actionTrait('response', action));
