import { ActionStore } from '../storage/interfaces/actionStore';
import { Action } from '../types/action';
import { TimeProvider } from './interfaces/timeProvider';

export class ActionService {
  constructor(private store: ActionStore, private timeProvider: TimeProvider) {}

  /**
   * Record a user action with automatic timestamp
   */
  recordAction(actionData: Omit<Action, 'timestamp'>): void {
    const action: Action = {
      ...actionData,
      timestamp: this.timeProvider.getCurrentTimeIso(),
    };
    this.store.recordAction(action);
  }

  /**
   * Get all recorded actions
   */
  getAllActions(): Action[] {
    return this.store.getAllActions();
  }

  /**
   * Get action statistics and analytics
   */
  getActionStats(): {
    total: number;
    today: number;
    last7Days: number;
    byType: Record<string, number>;
    byName: Record<string, number>;
    averageTimeToAction: number;
  } {
    const actions = this.store.getAllActions();
    const now = this.timeProvider.getCurrentTimeIso();
    const today = new Date(now.split('T')[0]);
    const last7Days = new Date(now.split('T')[0]);
    last7Days.setDate(last7Days.getDate() - 7);

    const total = actions.length;

    const todayActions = actions.filter(
      (action) =>
        new Date(action.timestamp.split('T')[0]).toDateString() ===
        today.toDateString()
    ).length;

    const last7DaysActions = actions.filter(
      (action) =>
        new Date(action.timestamp.split('T')[0]) >= last7Days &&
        new Date(action.timestamp.split('T')[0]) <= today
    ).length;

    // Group by type
    const byType = actions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by name
    const byName = actions.reduce((acc, action) => {
      acc[action.name] = (acc[action.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average time to action
    const averageTimeToAction =
      actions.length > 0
        ? actions.reduce((sum, action) => sum + action.timeToAction, 0) /
          actions.length
        : 0;

    return {
      total,
      today: todayActions,
      last7Days: last7DaysActions,
      byType,
      byName,
      averageTimeToAction,
    };
  }

  /**
   * Get actions filtered by specific criteria
   */
  getActionsByType(type: string): Action[] {
    return this.store.getAllActions().filter((action) => action.type === type);
  }

  getActionsByName(name: string): Action[] {
    return this.store.getAllActions().filter((action) => action.name === name);
  }

  getActionsByDateRange(startDate: string, endDate: string): Action[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.store.getAllActions().filter((action) => {
      const actionDate = new Date(action.timestamp);
      return actionDate >= start && actionDate <= end;
    });
  }
}
