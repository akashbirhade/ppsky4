// Pure, framework-free logic for swipe-to-next-profile navigation used by
// ProfileDetailScreen. Kept free of React/React-Native imports so it can be
// unit tested in isolation (see __tests__/swipeNavigation.test.ts).

/** Minimum horizontal travel (px) before a gesture is considered a swipe. */
export const SWIPE_MIN_DX = 15;

/**
 * A gesture must be at least this many times more horizontal than vertical to
 * be claimed as a profile swipe (so vertical scrolling isn't hijacked).
 */
export const SWIPE_DIRECTION_RATIO = 1.5;

/** Swipe direction: -1 = previous profile, +1 = next profile, 0 = no change. */
export type SwipeDirection = -1 | 1 | 0;

/**
 * Decide whether a move gesture should be claimed as a horizontal profile
 * swipe. Requires a navigable list (len > 1), enough horizontal travel, and a
 * predominantly horizontal direction.
 */
export function shouldStartHorizontalSwipe(dx: number, dy: number, len: number): boolean {
  return (
    len > 1 &&
    Math.abs(dx) > SWIPE_MIN_DX &&
    Math.abs(dx) > Math.abs(dy) * SWIPE_DIRECTION_RATIO
  );
}

/**
 * Whether the live drag offset should be applied to the card. Dragging right
 * (dx > 0) only shows feedback when a previous profile exists; dragging left
 * (dx < 0) only when a next profile exists.
 */
export function allowDrag(dx: number, canGoPrev: boolean, canGoNext: boolean): boolean {
  if (dx > 0) return canGoPrev;
  if (dx < 0) return canGoNext;
  return true;
}

/**
 * Resolve the navigation direction when a swipe is released.
 * dx > threshold  → go to previous (-1) if allowed.
 * dx < -threshold → go to next (+1) if allowed.
 * Otherwise 0 (snap back, no navigation).
 */
export function resolveSwipeDirection(
  dx: number,
  threshold: number,
  canGoPrev: boolean,
  canGoNext: boolean
): SwipeDirection {
  if (dx > threshold && canGoPrev) return -1;
  if (dx < -threshold && canGoNext) return 1;
  return 0;
}

/**
 * Compute the target index for a navigation step, or null if it would fall
 * outside the list bounds.
 */
export function nextIndex(currentIndex: number, dir: SwipeDirection, len: number): number | null {
  if (dir === 0) return null;
  const target = currentIndex + dir;
  if (target < 0 || target >= len) return null;
  return target;
}

/**
 * The active swipe list: an explicit list passed via navigation params wins
 * when it has more than one entry, otherwise the lazily-fetched fallback list.
 */
export function buildSwipeList(paramIds: string[], fallbackIds: string[]): string[] {
  return paramIds.length > 1 ? paramIds : fallbackIds;
}

/** The userId currently shown, given the active list, index and initial id. */
export function resolveCurrentUserId(
  navList: string[],
  navIndex: number,
  initialUserId: string
): string {
  return navList.length > 0 ? navList[navIndex] : initialUserId;
}

/** Whether prev/next navigation is available at the given index. */
export function computeNavFlags(
  navList: string[],
  navIndex: number
): { canGoPrev: boolean; canGoNext: boolean } {
  return {
    canGoPrev: navList.length > 0 && navIndex > 0,
    canGoNext: navList.length > 0 && navIndex < navList.length - 1,
  };
}

/**
 * Build the fallback swipe list from a recommended-profiles payload, ensuring
 * the initially-opened profile is included exactly once and appears first when
 * it wasn't already present. Ids are de-duplicated to avoid getting "stuck" on
 * a repeated entry while swiping.
 */
export function buildFallbackIds(profiles: any[], initialUserId: string): string[] {
  const ids: string[] = (profiles || [])
    .map((p: any) => p?.user?.id || p?.id)
    .filter((id: any): id is string => Boolean(id));

  const withInitial = ids.includes(initialUserId) ? ids : [initialUserId, ...ids];

  // De-duplicate while preserving order.
  return withInitial.filter((id, i) => withInitial.indexOf(id) === i);
}
