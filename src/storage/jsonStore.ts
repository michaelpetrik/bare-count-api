import fs from 'fs';
import path from 'path';
import { VisitStore } from './interfaces/visitStore';
import { ActionStore } from './interfaces/actionStore';
import { Visit } from '../types/visit';
import { Action } from '../types/action';

const DEFAULT_FILE_PATH =
  process.env.STORAGE_PATH?.trim() || '/app/data/storage.json';

interface StorageData {
  visits: Visit[];
  actions: Action[];
}

export class JsonStore implements VisitStore, ActionStore {
  private filePath: string;
  private fileChecked: boolean = false;

  private ensureFileExists(): void {
    if (this.fileChecked) return;

    console.log('Checking file existence at:', this.filePath);
    if (!fs.existsSync(this.filePath)) {
      console.log('File does not exist, creating:', this.filePath);
      const initialData: StorageData = { visits: [], actions: [] };
      fs.writeFileSync(this.filePath, JSON.stringify(initialData, null, 2));
    } else {
      console.log('File already exists at:', this.filePath);
    }
    this.fileChecked = true;
  }

  private readData(): StorageData {
    this.ensureFileExists();
    const rawData = fs.readFileSync(this.filePath, 'utf-8');
    const data = JSON.parse(rawData);

    // Handle backward compatibility - if it's an array, convert to new format
    if (Array.isArray(data)) {
      return { visits: data as Visit[], actions: [] };
    }

    return data as StorageData;
  }

  private writeData(data: StorageData): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  constructor(filePath: string = DEFAULT_FILE_PATH) {
    this.filePath = filePath;
    console.log('JsonStore initialized with path:', this.filePath);
    // Don't check file existence immediately - do it lazily on first use
  }

  getAllVisits(): Visit[] {
    const data = this.readData();
    return data.visits;
  }

  recordVisit(visit: Visit): void {
    const data = this.readData();
    data.visits.push(visit);
    this.writeData(data);
  }

  getAllActions(): Action[] {
    const data = this.readData();
    return data.actions;
  }

  recordAction(action: Action): void {
    const data = this.readData();
    data.actions.push(action);
    this.writeData(data);
  }
}
