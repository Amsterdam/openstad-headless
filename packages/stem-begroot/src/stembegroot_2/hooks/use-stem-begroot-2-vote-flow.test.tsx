import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { StemBegroot2WidgetProps } from '../types';
import { useStemBegroot2VoteFlow } from './use-stem-begroot-2-vote-flow';

vi.mock('../../../../lib/NotificationProvider/notification-service', () => ({
  default: { addNotification: vi.fn() },
}));

function baseVotes(
  overrides: Partial<StemBegroot2WidgetProps['votes']> = {}
): StemBegroot2WidgetProps['votes'] {
  return {
    isViewable: true,
    isActive: true,
    requiredUserRole: 'member',
    mustConfirm: false,
    withExisting: 'replace',
    voteType: 'likes',
    voteValues: [],
    maxResources: 5,
    minResources: 1,
    minBudget: 1,
    maxBudget: 100,
    ...overrides,
  };
}

function memberUser() {
  return { id: 1, role: 'member' };
}

function renderVoteFlowHarness(options: {
  voteOverrides?: Partial<StemBegroot2WidgetProps['votes']>;
  initialStep?: number;
  initialSelected?: Array<{ id: number; budget: number }>;
  initialTagCounter?: Array<Record<string, any>>;
  activeTagTab?: string;
  voteAfterLoggingIn?: boolean;
  resourcesRecords?: Array<{ id: number; budget: number }>;
}) {
  const {
    voteOverrides,
    initialStep = 0,
    initialSelected = [],
    initialTagCounter = [],
    activeTagTab: initialActiveTagTab = '',
    voteAfterLoggingIn = false,
    resourcesRecords = [{ id: 1, budget: 10 }],
  } = options;

  const submitVotes = vi.fn().mockResolvedValue({});
  const votePendingStorage = {
    getVotePending: vi.fn(() => null),
    setVotePending: vi.fn(),
    clearVotePending: vi.fn(),
    getVotePendingPerTag: vi.fn(() => null),
    setVotePendingPerTag: vi.fn(),
    clearVotePendingPerTag: vi.fn(),
  };
  const selectedResourcesStorage = {
    clearSelectedResources: vi.fn(),
  };
  const resources = { records: resourcesRecords };

  const props: Pick<StemBegroot2WidgetProps, 'votes' | 'api' | 'projectId'> = {
    projectId: 'test-project',
    api: { url: 'https://api.example.test' },
    votes: baseVotes(voteOverrides),
  };

  const visitedTagTabs: string[] = [];

  const { result } = renderHook(() => {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [selectedResources, setSelectedResources] = useState(initialSelected);
    const [tagCounter, setTagCounter] = useState(initialTagCounter);
    const [activeTagTab, setActiveTagTab] = useState(initialActiveTagTab);

    const flow = useStemBegroot2VoteFlow({
      props,
      currentUser: memberUser(),
      currentStep,
      setCurrentStep,
      selectedResources,
      setSelectedResources,
      tagCounter,
      setTagCounter,
      activeTagTab,
      setActiveTagTab,
      visitedTagTabs,
      votePendingStorage,
      selectedResourcesStorage,
      resources,
      submitVotes,
      voteAfterLoggingIn,
    });

    return {
      ...flow,
      currentStep,
      setCurrentStep,
      selectedResources,
      tagCounter,
      submitVotes,
      votePendingStorage,
      selectedResourcesStorage,
    };
  });

  return { result, submitVotes, votePendingStorage, selectedResourcesStorage };
}

describe('useStemBegroot2VoteFlow', () => {
  beforeEach(() => {
    vi.stubGlobal('location', {
      ...window.location,
      href: 'https://widget.example/vote',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('nextButtonDisabled is true for likes when nothing is selected', () => {
    const { result } = renderVoteFlowHarness({});
    expect(result.current.nextButtonDisabled).toBe(true);
  });

  test('nextButtonDisabled is false for likes when at least one resource is selected', () => {
    const { result } = renderVoteFlowHarness({
      initialSelected: [{ id: 1, budget: 10 }],
    });
    expect(result.current.nextButtonDisabled).toBe(false);
  });

  test('prepareForVote writes pending map for likes vote type', () => {
    const { result } = renderVoteFlowHarness({
      initialSelected: [{ id: 7, budget: 5 }],
    });

    act(() => {
      result.current.prepareForVote(null);
    });

    expect(
      result.current.votePendingStorage.setVotePending
    ).toHaveBeenCalledWith({ 7: 'yes' });
  });

  test('handleNextClick on step 0 persists pending vote and advances to step 1', async () => {
    const { result } = renderVoteFlowHarness({
      initialSelected: [{ id: 1, budget: 10 }],
    });

    await act(async () => {
      await result.current.handleNextClick();
    });

    expect(
      result.current.votePendingStorage.setVotePending
    ).toHaveBeenCalledWith({ 1: 'yes' });
    expect(result.current.currentStep).toBe(1);
  });

  test('submitVoteAndCleanup submits selected resources and clears storages', async () => {
    const { result } = renderVoteFlowHarness({
      initialSelected: [{ id: 1, budget: 10 }],
    });

    let submitted = false;
    await act(async () => {
      submitted = await result.current.submitVoteAndCleanup();
    });

    expect(submitted).toBe(true);
    expect(result.current.submitVotes).toHaveBeenCalledWith([
      { resourceId: 1, opinion: 'yes' },
    ]);
    expect(
      result.current.votePendingStorage.clearVotePending
    ).toHaveBeenCalled();
    expect(
      result.current.selectedResourcesStorage.clearSelectedResources
    ).toHaveBeenCalled();
  });

  test('submitVoteAndCleanup does not call API when voting is inactive', async () => {
    const { result } = renderVoteFlowHarness({
      voteOverrides: { isActive: false },
      initialSelected: [{ id: 1, budget: 10 }],
    });

    let submitted = false;
    await act(async () => {
      submitted = await result.current.submitVoteAndCleanup();
    });

    expect(submitted).toBe(false);
    expect(result.current.submitVotes).not.toHaveBeenCalled();
  });

  test('handleNextClick on step 3 submits and moves to step 4 when submission succeeds', async () => {
    const { result } = renderVoteFlowHarness({
      initialStep: 3,
      initialSelected: [{ id: 1, budget: 10 }],
    });

    await act(async () => {
      await result.current.handleNextClick();
    });

    expect(result.current.submitVotes).toHaveBeenCalled();
    expect(result.current.currentStep).toBe(4);
  });

  test('nextButtonLabel on step 3 is the submit copy', () => {
    const { result } = renderVoteFlowHarness({ initialStep: 3 });
    expect(result.current.nextButtonLabel).toBe('Stem indienen');
  });

  test('prepareForVote writes per-tag pending structure for countPerTag', () => {
    const tagCounter = [
      {
        parks: {
          min: 1,
          max: 3,
          current: 1,
          selectedResources: [{ id: 2, budget: 0 }],
        },
      },
    ];

    const { result } = renderVoteFlowHarness({
      voteOverrides: { voteType: 'countPerTag' },
      initialTagCounter: tagCounter,
      activeTagTab: 'parks',
    });

    act(() => {
      result.current.prepareForVote(null);
    });

    expect(
      result.current.votePendingStorage.setVotePendingPerTag
    ).toHaveBeenCalledWith({ parks: { 2: 'yes' } });
  });
});
