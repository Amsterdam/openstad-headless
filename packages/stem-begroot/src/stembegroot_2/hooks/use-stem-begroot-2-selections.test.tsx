import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import type { StemBegroot2WidgetProps } from '../types';
import { useStemBegroot2Selections } from './use-stem-begroot-2-selections';

vi.mock('@openstad-headless/lib', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@openstad-headless/lib')>();
  return {
    ...mod,
    getScopedSessionRandomSortSeed: vi.fn(() => 42_001),
  };
});

function minimalProps(
  votes: Partial<StemBegroot2WidgetProps['votes']> & {
    voteType: StemBegroot2WidgetProps['votes']['voteType'];
  },
  extra: Partial<StemBegroot2WidgetProps> = {}
): StemBegroot2WidgetProps {
  return {
    ...extra,
    votes: {
      isViewable: true,
      isActive: true,
      requiredUserRole: 'member',
      mustConfirm: false,
      withExisting: 'replace',
      voteType: votes.voteType,
      voteValues: [],
      maxResources: votes.maxResources ?? 5,
      minResources: votes.minResources ?? 1,
      minBudget: votes.minBudget ?? 1,
      maxBudget: votes.maxBudget ?? 100,
      ...votes,
    },
  } as StemBegroot2WidgetProps;
}

function storageMocks() {
  return {
    selectedResourcesStorage: {
      getSelectedResources: vi.fn(() => null),
      setSelectedResources: vi.fn(),
      clearSelectedResources: vi.fn(),
    },
    votePendingStorage: {
      clearAllVotePending: vi.fn(),
      getVotePending: vi.fn(() => null),
      getVotePendingPerTag: vi.fn(() => null),
      setVotePending: vi.fn(),
      setVotePendingPerTag: vi.fn(),
      clearVotePending: vi.fn(),
      clearVotePendingPerTag: vi.fn(),
    },
  };
}

function datastoreWithRecords(
  records: Array<{ id: number; budget: number }>,
  submitVotes = vi.fn().mockResolvedValue({})
) {
  return {
    useResources: () => ({
      data: { records },
      submitVotes,
    }),
  };
}

describe('useStemBegroot2Selections', () => {
  test('likes: primary click adds a resource and second click removes it', async () => {
    const r1 = { id: 101, budget: 0 };
    const { selectedResourcesStorage, votePendingStorage } = storageMocks();

    const { result } = renderHook(() =>
      useStemBegroot2Selections({
        props: minimalProps({ voteType: 'likes', maxResources: 5 }),
        onlyIncludeTagIds: '',
        onlyIncludeStatusIds: '',
        datastore: datastoreWithRecords([r1]),
        allTags: [],
        selectedResourcesStorage,
        votePendingStorage,
        scrollWhenMaxReached: false,
        step1Delete: 'Verwijder',
        step1Add: 'Voeg toe',
        notEnoughBudgetText: 'Niet genoeg budget',
      })
    );

    await act(async () => {
      result.current.onResourcePrimaryClicked(r1);
    });
    expect(result.current.selectedResources.map((r) => r.id)).toEqual([101]);

    await act(async () => {
      result.current.onResourcePrimaryClicked(r1);
    });
    expect(result.current.selectedResources).toEqual([]);
  });

  test('budgeting: cannot select a resource that would exceed maxBudget', async () => {
    const heavy = { id: 1, budget: 80 };
    const extra = { id: 2, budget: 50 };
    const { selectedResourcesStorage, votePendingStorage } = storageMocks();

    const { result } = renderHook(() =>
      useStemBegroot2Selections({
        props: minimalProps({ voteType: 'budgeting', maxBudget: 100 }),
        onlyIncludeTagIds: '',
        onlyIncludeStatusIds: '',
        datastore: datastoreWithRecords([heavy, extra]),
        allTags: [],
        selectedResourcesStorage,
        votePendingStorage,
        scrollWhenMaxReached: false,
        step1Delete: 'Verwijder',
        step1Add: 'Voeg toe',
        notEnoughBudgetText: 'Niet genoeg budget',
      })
    );

    await act(async () => {
      result.current.onResourcePrimaryClicked(heavy);
    });

    expect(result.current.resourceSelectable(extra)).toBe(false);
    expect(result.current.resourceSelectable(heavy)).toBe(true);
  });

  test('countPerTag: toggles selection for the active tag tab', async () => {
    const res = { id: 55, budget: 0 };
    const { selectedResourcesStorage, votePendingStorage } = storageMocks();

    const { result } = renderHook(() =>
      useStemBegroot2Selections({
        props: minimalProps(
          { voteType: 'countPerTag', minResources: 1, maxResources: 3 },
          {
            tagTypeSelector: 'group',
            tagTypeTagGroup: ['Theme'],
          }
        ),
        onlyIncludeTagIds: '',
        onlyIncludeStatusIds: '',
        datastore: datastoreWithRecords([res]),
        allTags: [],
        selectedResourcesStorage,
        votePendingStorage,
        scrollWhenMaxReached: false,
        step1Delete: 'Verwijder',
        step1Add: 'Voeg toe',
        notEnoughBudgetText: 'Niet genoeg budget',
      })
    );

    await waitFor(() => {
      expect(result.current.tagCounter).toHaveLength(1);
    });

    await act(async () => {
      result.current.setActiveTagTab('Theme');
    });

    await act(async () => {
      result.current.onResourcePrimaryClicked(res);
    });

    const block = result.current.tagCounter[0].Theme;
    expect(block.selectedResources.map((r: { id: number }) => r.id)).toEqual([
      55,
    ]);
    expect(block.current).toBe(1);

    await act(async () => {
      result.current.onResourcePrimaryClicked(res);
    });

    const blockAfter = result.current.tagCounter[0].Theme;
    expect(blockAfter.selectedResources).toEqual([]);
    expect(blockAfter.current).toBe(0);
  });

  test('onSelectedResourceRemove clears a resource from likes selection', async () => {
    const r1 = { id: 9, budget: 0 };
    const { selectedResourcesStorage, votePendingStorage } = storageMocks();

    const { result } = renderHook(() =>
      useStemBegroot2Selections({
        props: minimalProps({ voteType: 'likes', maxResources: 5 }),
        onlyIncludeTagIds: '',
        onlyIncludeStatusIds: '',
        datastore: datastoreWithRecords([r1]),
        allTags: [],
        selectedResourcesStorage,
        votePendingStorage,
        scrollWhenMaxReached: false,
        step1Delete: 'Verwijder',
        step1Add: 'Voeg toe',
        notEnoughBudgetText: 'Niet genoeg budget',
      })
    );

    await act(async () => {
      result.current.onResourcePrimaryClicked(r1);
    });

    await act(async () => {
      result.current.onSelectedResourceRemove(r1);
    });

    expect(result.current.selectedResources).toEqual([]);
  });
});
