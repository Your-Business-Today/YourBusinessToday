import { businessBrainFileLimits, businessBrainUploadLinkLifetimeHours } from '$lib/data/businessBrainFileRules';
import { fetchLinkLifetimeMinutes } from '$lib/server/storage/signFetchLink';
import { grantFileUpload, openKeptFile, recordFileUpload } from './businessBrainFileRuns';
import { openKeptFileAction } from './businessBrainKeptFileSections';
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

const openGuidance = [
	'For the document, photo or export a page was written from, when the page alone does not answer. A page read lists the files it ' +
		'names, and read_business_brain_index lists any no page names yet.',
	`The answer is a link that lasts ${fetchLinkLifetimeMinutes} minutes, for you to fetch the file from now. Answer from the file as you would ` +
		'from a page, naming the file; do not pass the link on. Only a file that has arrived is opened, and opening it changes nothing.'
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
	}),
	moduleAction(businessBrainModule, {
		name: openKeptFileAction,
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary: "open one file kept in an organisation's Your Business Brain: a link to fetch it from that lasts a few minutes",
		guidance: openGuidance,
		inputSchema: objectSchema(
			{ organisationId: organisationField, fileId: textField('The file, as a page read or read_business_brain_index lists it') },
			['organisationId', 'fileId']
		),
		run: openKeptFile
	})
];
