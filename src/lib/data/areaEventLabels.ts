import type { AreaEventKind } from './areaEventKind';

/** The short word on the event's pill. */
export const areaEventLabels: Record<AreaEventKind, string> = {
	sector_claimed: 'Claimed',
	sector_searched: 'Searched',
	sighting_recorded: 'Sighted',
	sighting_became_lead: 'Lead',
	lead_added_from_register: 'Lead',
	company_arrived: 'New company',
	company_moved_in: 'Moved in',
	company_left: 'Left',
	status_changed: 'Status',
	accounts_category_changed: 'Accounts',
	accounts_overdue: 'Overdue',
	charge_registered: 'Charge',
	holding_company_over_trading: 'Holding co.',
	observation_recorded: 'Observed',
	premises_opened: 'Opened',
	premises_reinspected: 'Re-inspected',
	premises_closed: 'Closed',
	premises_changed_hands: 'Changed hands',
	lead_added_from_premises: 'Lead',
	accounts_filed: 'Accounts filed',
	figures_read: 'Figures',
	winding_up_petitioned: 'Petition',
	administration_opened: 'Administration',
	liquidator_appointed: 'Liquidator',
	place_arrived: 'Place',
	place_removed: 'Place gone'
};
