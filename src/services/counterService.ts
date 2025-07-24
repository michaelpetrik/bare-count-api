import { VisitStore } from '../storage/interfaces/visitStore';
import { TimeProvider } from './interfaces/timeProvider';

export class CounterService {
  constructor(private store: VisitStore, private timeProvider: TimeProvider) {}

  recordVisit(): void {
    this.store.recordVisit(this.timeProvider.getCurrentTimeIso());
  }
}
