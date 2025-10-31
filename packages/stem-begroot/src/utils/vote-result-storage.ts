// not proud of this one, but need to get it working for now

class VoteResultStorage {
  private storageKey: string;

  constructor(projectId?: string | number) {
    this.storageKey = `oscBegrootVoteResult_project${projectId}`;
  }

  getVoteResult(): any | null {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  setVoteResult(success: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(success));
  }

  clearVoteResult(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const createVoteResultStorage = (projectId?: string | number): VoteResultStorage => {
  return new VoteResultStorage(projectId);
};