import { createContext, useContext } from 'react';
import type { TravelStyle } from '../../utils/travel';

/**
 * Trip the page on screen arrived with (LOT 3): 'none' on first load.
 * Provided by PageTravel from the trip channel (useTravel → AnimatePresence
 * custom); read by a page that greets its arrival (the convector's 88:88 test).
 */
export const ArrivalContext = createContext<TravelStyle>('none');

export function useArrivalStyle(): TravelStyle {
    return useContext(ArrivalContext);
}
