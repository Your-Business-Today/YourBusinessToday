import { brandKitReadActions } from './brandKitReadActions';
import { brandKitWriteActions } from './brandKitWriteActions';
import { brandSheetAction } from './brandSheetAction';
import type { McpAction } from '../actionTypes';

/** Every connector action on an organisation's brand kit: what a person's Claude reads, what it sets, and the sheet a project builds to. */
export const brandKitActions: McpAction[] = [...brandKitReadActions, brandSheetAction, ...brandKitWriteActions];
