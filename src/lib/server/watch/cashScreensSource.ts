import { runCashScreens } from '$lib/server/cashScreens/runCashScreens';
import type { WatchSource } from './watchSource';

/** Works through the screens staff have started, oldest first; the screen itself keeps where it got to. */
export const cashScreensSource: WatchSource = {
	name: 'cash_screens',
	summary: "screens a territory's companies for cash at bank, reading their accounts and who is behind them",
	run: (supabase, _start, progress) => runCashScreens(supabase, progress)
};
