import {
  SWIPE_MIN_DX,
  SWIPE_DIRECTION_RATIO,
  shouldStartHorizontalSwipe,
  allowDrag,
  resolveSwipeDirection,
  nextIndex,
  buildSwipeList,
  resolveCurrentUserId,
  computeNavFlags,
  buildFallbackIds,
} from '../swipeNavigation';

// Realistic threshold: on a ~390px wide phone SWIPE_THRESHOLD = width * 0.25 ≈ 97px.
const THRESHOLD = 97;

describe('shouldStartHorizontalSwipe (claim gesture as a profile swipe)', () => {
  it('claims a clearly horizontal drag when the list is navigable', () => {
    expect(shouldStartHorizontalSwipe(-60, 5, 3)).toBe(true);
    expect(shouldStartHorizontalSwipe(60, 5, 3)).toBe(true);
  });

  it('ignores a mostly-vertical drag (lets the ScrollView scroll)', () => {
    expect(shouldStartHorizontalSwipe(20, 40, 3)).toBe(false);
  });

  it('ignores tiny movements below the minimum travel', () => {
    expect(shouldStartHorizontalSwipe(SWIPE_MIN_DX - 1, 0, 3)).toBe(false);
    expect(shouldStartHorizontalSwipe(SWIPE_MIN_DX + 1, 0, 3)).toBe(true);
  });

  it('never claims a swipe when there is nothing to navigate to', () => {
    expect(shouldStartHorizontalSwipe(200, 0, 1)).toBe(false);
    expect(shouldStartHorizontalSwipe(200, 0, 0)).toBe(false);
  });

  it('respects the horizontal:vertical ratio boundary', () => {
    // dx just over ratio*dy -> claimed; just under -> not
    const dy = 20;
    expect(shouldStartHorizontalSwipe(dy * SWIPE_DIRECTION_RATIO + 1, dy, 3)).toBe(true);
    expect(shouldStartHorizontalSwipe(dy * SWIPE_DIRECTION_RATIO - 1, dy, 3)).toBe(false);
  });
});

describe('allowDrag (live drag feedback gating)', () => {
  it('allows dragging left only when a next profile exists', () => {
    expect(allowDrag(-50, /*prev*/ false, /*next*/ true)).toBe(true);
    expect(allowDrag(-50, /*prev*/ true, /*next*/ false)).toBe(false);
  });

  it('allows dragging right only when a previous profile exists', () => {
    expect(allowDrag(50, /*prev*/ true, /*next*/ false)).toBe(true);
    expect(allowDrag(50, /*prev*/ false, /*next*/ true)).toBe(false);
  });
});

describe('resolveSwipeDirection (release -> navigation intent)', () => {
  it('swiping LEFT past the threshold goes to the NEXT profile', () => {
    expect(resolveSwipeDirection(-(THRESHOLD + 1), THRESHOLD, false, true)).toBe(1);
  });

  it('swiping RIGHT past the threshold goes to the PREVIOUS profile', () => {
    expect(resolveSwipeDirection(THRESHOLD + 1, THRESHOLD, true, false)).toBe(-1);
  });

  it('does nothing when the swipe does not reach the threshold', () => {
    expect(resolveSwipeDirection(-(THRESHOLD - 1), THRESHOLD, true, true)).toBe(0);
    expect(resolveSwipeDirection(THRESHOLD - 1, THRESHOLD, true, true)).toBe(0);
  });

  it('does nothing at the list boundaries even past the threshold', () => {
    // Last profile: cannot go next
    expect(resolveSwipeDirection(-(THRESHOLD + 50), THRESHOLD, true, false)).toBe(0);
    // First profile: cannot go prev
    expect(resolveSwipeDirection(THRESHOLD + 50, THRESHOLD, false, true)).toBe(0);
  });
});

describe('nextIndex (bounds-checked index step)', () => {
  it('advances forward within bounds', () => {
    expect(nextIndex(0, 1, 3)).toBe(1);
    expect(nextIndex(1, 1, 3)).toBe(2);
  });

  it('advances backward within bounds', () => {
    expect(nextIndex(2, -1, 3)).toBe(1);
  });

  it('returns null past the end', () => {
    expect(nextIndex(2, 1, 3)).toBeNull();
  });

  it('returns null before the start', () => {
    expect(nextIndex(0, -1, 3)).toBeNull();
  });

  it('returns null for a no-op direction', () => {
    expect(nextIndex(1, 0, 3)).toBeNull();
  });
});

describe('buildSwipeList (explicit list wins over fallback)', () => {
  it('uses the explicit param list when it has more than one entry', () => {
    expect(buildSwipeList(['a', 'b', 'c'], ['x', 'y'])).toEqual(['a', 'b', 'c']);
  });

  it('falls back to the recommended list when no usable param list', () => {
    expect(buildSwipeList([], ['x', 'y'])).toEqual(['x', 'y']);
    expect(buildSwipeList(['only'], ['x', 'y'])).toEqual(['x', 'y']);
  });
});

describe('resolveCurrentUserId', () => {
  it('reads from the active list by index', () => {
    expect(resolveCurrentUserId(['a', 'b', 'c'], 1, 'z')).toBe('b');
  });

  it('falls back to the initial id when the list is empty', () => {
    expect(resolveCurrentUserId([], 0, 'z')).toBe('z');
  });
});

describe('computeNavFlags', () => {
  it('has no prev at the first item, has next', () => {
    expect(computeNavFlags(['a', 'b', 'c'], 0)).toEqual({ canGoPrev: false, canGoNext: true });
  });

  it('has both in the middle', () => {
    expect(computeNavFlags(['a', 'b', 'c'], 1)).toEqual({ canGoPrev: true, canGoNext: true });
  });

  it('has prev but no next at the last item', () => {
    expect(computeNavFlags(['a', 'b', 'c'], 2)).toEqual({ canGoPrev: true, canGoNext: false });
  });

  it('is fully disabled for an empty list', () => {
    expect(computeNavFlags([], 0)).toEqual({ canGoPrev: false, canGoNext: false });
  });
});

describe('buildFallbackIds (lazy swipe list from recommendations)', () => {
  it('extracts ids from user.id then falls back to top-level id', () => {
    const profiles = [{ user: { id: 'u1' } }, { id: 'u2' }, { user: { id: 'u3' } }];
    expect(buildFallbackIds(profiles, 'u1')).toEqual(['u1', 'u2', 'u3']);
  });

  it('prepends the initial id when the recommendations exclude it', () => {
    const profiles = [{ user: { id: 'u2' } }, { user: { id: 'u3' } }];
    expect(buildFallbackIds(profiles, 'u1')).toEqual(['u1', 'u2', 'u3']);
  });

  it('does not duplicate the initial id when already present', () => {
    const profiles = [{ user: { id: 'u1' } }, { user: { id: 'u2' } }];
    const ids = buildFallbackIds(profiles, 'u1');
    expect(ids).toEqual(['u1', 'u2']);
    expect(ids.filter((id) => id === 'u1')).toHaveLength(1);
  });

  it('de-duplicates repeated ids so swiping never gets stuck', () => {
    const profiles = [{ user: { id: 'u1' } }, { user: { id: 'u2' } }, { user: { id: 'u2' } }];
    expect(buildFallbackIds(profiles, 'u1')).toEqual(['u1', 'u2']);
  });

  it('drops entries with no id', () => {
    const profiles = [{ user: {} }, { foo: 'bar' }, { user: { id: 'u2' } }];
    expect(buildFallbackIds(profiles, 'u1')).toEqual(['u1', 'u2']);
  });

  it('handles an empty / missing payload', () => {
    expect(buildFallbackIds([], 'u1')).toEqual(['u1']);
    expect(buildFallbackIds(undefined as any, 'u1')).toEqual(['u1']);
  });
});

describe('end-to-end swipe simulation (gesture -> new profile shown)', () => {
  // Simulate the full flow a user experiences: open a profile with a list,
  // perform swipe gestures, and assert which profile ends up on screen.
  function makeSession(navList: string[], startIndex: number) {
    let navIndex = startIndex;
    return {
      currentUserId: () => resolveCurrentUserId(navList, navIndex, navList[startIndex]),
      /** Simulate a released swipe of `dx` px and apply the resulting navigation. */
      swipe(dx: number) {
        const { canGoPrev, canGoNext } = computeNavFlags(navList, navIndex);
        if (!shouldStartHorizontalSwipe(dx, 0, navList.length)) return;
        const dir = resolveSwipeDirection(dx, THRESHOLD, canGoPrev, canGoNext);
        const target = nextIndex(navIndex, dir, navList.length);
        if (target !== null) navIndex = target;
      },
    };
  }

  it('swiping left moves through the list to the next profile each time', () => {
    const s = makeSession(['a', 'b', 'c'], 0);
    expect(s.currentUserId()).toBe('a');
    s.swipe(-(THRESHOLD + 10)); // left -> next
    expect(s.currentUserId()).toBe('b');
    s.swipe(-(THRESHOLD + 10)); // left -> next
    expect(s.currentUserId()).toBe('c');
    s.swipe(-(THRESHOLD + 10)); // at end -> stays
    expect(s.currentUserId()).toBe('c');
  });

  it('swiping right walks back to previous profiles', () => {
    const s = makeSession(['a', 'b', 'c'], 2);
    expect(s.currentUserId()).toBe('c');
    s.swipe(THRESHOLD + 10); // right -> prev
    expect(s.currentUserId()).toBe('b');
    s.swipe(THRESHOLD + 10); // right -> prev
    expect(s.currentUserId()).toBe('a');
    s.swipe(THRESHOLD + 10); // at start -> stays
    expect(s.currentUserId()).toBe('a');
  });

  it('a weak (below-threshold) swipe does not change the profile', () => {
    const s = makeSession(['a', 'b', 'c'], 0);
    s.swipe(-(THRESHOLD - 5));
    expect(s.currentUserId()).toBe('a');
  });

  it('a vertical drag does not change the profile', () => {
    const s = makeSession(['a', 'b', 'c'], 0);
    // shouldStartHorizontalSwipe rejects this, so swipe() is a no-op
    s.swipe(10);
    expect(s.currentUserId()).toBe('a');
  });
});
