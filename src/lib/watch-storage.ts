export const STORAGE_KEY = "watcharchive_items";
export const WATCHLIST_STORAGE_KEY = "watcharchive_watchlist";
export const STORAGE_UPDATED_EVENT = "watcharchive-updated";
export const WATCHLIST_UPDATED_EVENT = "watcharchive-watchlist-updated";

/** localStorage güncellendiğinde diğer sayfaların yenilenmesi için event dispatch eder */
export function dispatchWatchStorageUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORAGE_UPDATED_EVENT));
  }
}

/** Watchlist güncellendiğinde event dispatch eder */
export function dispatchWatchlistUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WATCHLIST_UPDATED_EVENT));
  }
}
