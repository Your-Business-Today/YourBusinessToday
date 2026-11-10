import { businessBrainFileLimits, businessBrainUploadLinkLifetimeHours } from '$lib/data/businessBrainFileRules';
import { grantFileUpload, recordFileUpload } from './businessBrainFileRuns';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const businessBrainModule = 'business_brain';
const { longestFilename, largestByteCount } = businessBrainFileLimits;
const organisationField = textField('The organisation whose brain it is, as list_organisations gives it');

const grantGuidance = [
	'For a document, a photo or an export you read and want kept with the pages you file from it. The file stays with the ' +
		"organisation's brain: only people who use that brain can read it, and nothing deletes it.",
	`The name, type and size are checked before the link is granted. The link takes one HTTP PUT of up to ${largestByteCount / (1024 * 1024)} MB ` +
		`and lasts ${businessBrainUploadLinkLifetimeHours} hours; the answer gives the command.`,
	'Send the file, call record_business_brain_file_upload with the fileId, then give the fileId in sourceFileIds when you file its pages.',
	'Never send a file holding passwords, keys, or personal details the business has no need to keep.'
].join('\n');

export const businessBrainFileActions: McpAction[] = [
	moduleAction(businessBrainModule, {
		name: 'grant_business_brain_file_upload',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "get a one-time link to send a source file — a document, a photo, an export — into an organisation's Your Business Brain",
		guidance: grantGuidance,
		inputSchema: objectSchema(
			{
				organisationId: organisationField,
				filename: textField(`What the file is called, such as staff-handbook-2026.pdf, at most ${longestFilename} characters`),
				mimeType: textField('The file type, such as application/pdf or image/jpeg'),
				byteCount: { type: 'integer', description: `The size of the file in bytes, at most ${largestByteCount}` }
			},
			['organisationId', 'filename', 'mimeType', 'byteCount']
		),
		run: grantFileUpload
	}),
	moduleAction(businessBrainModule, {
		name: 'record_business_brain_file_upload',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "keep the file sent to a link from grant_business_brain_file_upload in the organisation's Your Business Brain",
		guidance:
			'Call this once the PUT has succeeded. The file is kept at the size that actually arrived, under the person the link was ' +
			'granted to, and its fileId can then be named in sourceFileIds when filing a page.',
		inputSchema: objectSchema(
			{ organisationId: organisationField, fileId: textField('The fileId grant_business_brain_file_upload gave') },
			['organisationId', 'fileId']
		),
		run: recordFileUpload
	})
];
