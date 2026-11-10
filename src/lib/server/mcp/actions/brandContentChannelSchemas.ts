import { audienceActions } from '$lib/brand/actions/audienceActions';
import { CaptionRuleKeys } from '$lib/brand/captions/captionRules';
import { ContentLimits } from '$lib/brand/content/contentLimits';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';

const { captionCharacters } = ContentLimits;
const { fewestHashtags, mostHashtags, linkPlacement } = CaptionRuleKeys;

export const addContentChannelSchema = objectSchema(
	{
		organisationId: organisationIdField,
		contentPieceId: textField('The id of any channel of the post, as read_content, list_content or read_content_plan gives it'),
		medium: textField('The channel to add, such as image.post.facebook, as read_brand_catalogue lists; one the post does not go out on yet'),
		caption: textField(
			`The caption for this channel, at most ${captionCharacters} characters, written to the brand as resolve_brand gives ` +
				`it there: its hashtags between ${fewestHashtags} and ${mostHashtags}, and the link where ${linkPlacement} puts it`
		),
		invitedAction: {
			type: 'string',
			enum: audienceActions.map((action) => action.key),
			description: 'What it asks its audience to do on this channel — leave out to keep the post’s own, where the channel allows it'
		}
	},
	['organisationId', 'contentPieceId', 'medium']
);
