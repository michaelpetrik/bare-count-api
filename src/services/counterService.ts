import { VisitStore } from '../storage/interfaces/visitStore';
import { TimeProvider } from './interfaces/timeProvider';

export class CounterService {
  constructor(private store: VisitStore, private timeProvider: TimeProvider) {}

  recordVisit(): void {
    this.store.recordVisit(this.timeProvider.getCurrentTimeIso());
  }

  getVisitCounts(): { total: number; today: number; last7Days: number } {
    const visits = this.store.getAllVisits();
    const now = this.timeProvider.getCurrentTimeIso();
    const today = new Date(now.split('T')[0]);
    const last7Days = new Date(now.split('T')[0]);
    last7Days.setDate(last7Days.getDate() - 7);
    const total = visits.length;
    const todayVisits = visits.filter(
      (visit) =>
        new Date(visit.timestamp.split('T')[0]).toDateString() ===
        today.toDateString()
    ).length;
    const last7DaysVisits = visits.filter(
      (visit) =>
        new Date(visit.timestamp.split('T')[0]) >= last7Days &&
        new Date(visit.timestamp.split('T')[0]) <= today
    ).length;

    return { total: total, today: todayVisits, last7Days: last7DaysVisits };
  }
}
