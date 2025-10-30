// not proud of this one, but need to get it working for now

class SuccessStorage {
  private storageKey: string;

  constructor(projectId?: string | number) {
    this.storageKey = `oscBegrootSuccess_project${projectId}`;
  }

  getSuccess(): any | null {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  setSuccess(success: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(success));
  }

  clearSuccess(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const createSuccessStorage = (projectId?: string | number): SuccessStorage => {
  return new SuccessStorage(projectId);
};