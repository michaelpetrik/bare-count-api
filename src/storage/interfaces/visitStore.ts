import { Visit } from '../../types/visit';

export interface VisitStore {
  recordVisit(visit: Visit): void;
  getAllVisits(): Visit[];
}
