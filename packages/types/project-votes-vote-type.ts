/**
 * `votes.voteType` from project settings (admin form + API).
 * @see apps/admin-server/src/pages/projects/[project]/settings/voting.tsx
 */
export type ProjectVotesVoteType =
  | 'likes'
  | 'count'
  | 'budgeting'
  | 'countPerTag'
  | 'budgetingPerTag'
  | 'countPerTheme'
  | 'budgetingPerTheme';
