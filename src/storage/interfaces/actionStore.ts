import { Action } from '../../types/action';

export interface ActionStore {
  recordAction(action: Action): void;
  getAllActions(): Action[];
}
