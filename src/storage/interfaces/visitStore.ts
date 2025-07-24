import { Visit } from '../../types/visit';

export interface VisitStore {
  recordVisit(timestamp: string): void;
  getAllVisits(): Visit[];
}
