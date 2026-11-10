import { brandKitReadActions } from './brandKitReadActions';
import { brandKitWriteActions } from './brandKitWriteActions';
import type { McpAction } from '../actionTypes';

/** Every connector action on an organisation's brand kit: what a person's Claude reads, and what it sets. */
export const brandKitActions: McpAction[] = [...brandKitReadActions, ...brandKitWriteActions];
