import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { PictureLimits } from '$lib/brand/pictures/pictureLimits';

const { neededCharacters, expectedFromCharacters } = PictureLimits;

const contentPieceIdField = textField('The id of any channel of the post, as read_content, list_content or read_content_plan gives it');

export const sayPostPictureNeededSchema = objectSchema(
	{
		organisationId: organisationIdField,
		contentPieceId: contentPieceIdField,
		pictureNeeded: textField(`In words, the photo or video the post needs, at most ${neededCharacters} characters`),
		expectedFrom: textField(
			`Where it is expected to come from, such as the team on the job, the website’s portfolio or a stock picture, at most ${expectedFromCharacters} characters`
		)
	},
	['organisationId', 'contentPieceId', 'pictureNeeded']
);

export const choosePostPictureSchema = objectSchema(
	{
		organisationId: organisationIdField,
		contentPieceId: contentPieceIdField,
		itemId: textField('The photo or video, as list_brand_library gives its id')
	},
	['organisationId', 'contentPieceId', 'itemId']
);

export const listPostsAwaitingPictureSchema = objectSchema(
	{
		organisationId: organisationIdField,
		month: textField('The month as YYYY-MM, such as 2026-11 — leave out for this month on the UK clock')
	},
	['organisationId']
);
