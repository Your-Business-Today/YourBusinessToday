import type { TradingRouteName } from './tradingRoutes';

export const tradingRouteLabels: Record<TradingRouteName, string> = {
	employed: 'Employed',
	soleTrader: 'Sole trader',
	limitedCompany: 'Limited company'
};

export const tradingRouteNames = Object.keys(tradingRouteLabels) as TradingRouteName[];
