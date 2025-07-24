import fs from 'fs';
import path from 'path';
import { VisitStore } from './interfaces/visitStore';
import { Visit } from '../types/visit';

const DEFAULT_FILE_PATH = path.join(__dirname, '../../storage.json');

export class JsonStore implements VisitStore {
  private filePath: string;

  private ensureFileExists(): void {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  constructor(filePath: string = DEFAULT_FILE_PATH) {
    this.filePath = filePath;
    this.ensureFileExists();
  }
  getAllVisits(): Visit[] {
    this.ensureFileExists();
    const data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    return data as Visit[];
  }

  recordVisit(timestamp: string): void {
    this.ensureFileExists();
    const data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    data.push({ timestamp });
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }
}
