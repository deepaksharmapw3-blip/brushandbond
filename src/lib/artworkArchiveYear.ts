export const DEFAULT_ARTWORK_ARCHIVE_YEAR = 2026;

/** Missing or invalid DB years display and filter as the current archive default. */
export function resolveArtworkArchiveYear(year: unknown): number {
  const parsed = typeof year === 'number' ? year : Number(year);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : DEFAULT_ARTWORK_ARCHIVE_YEAR;
}
