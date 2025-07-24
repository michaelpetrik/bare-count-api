import { Request, Response } from 'express';
import { CounterService } from '../services/counterService';
import { JsonStore } from '../storage/jsonStore';
import { DefaultTimeProvider } from '../services/implementations/defaultTimeProvider';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

// Create shared instances to avoid recreation on each request
const jsonStore = new JsonStore();
const timeProvider = new DefaultTimeProvider();
const counterService = new CounterService(jsonStore, timeProvider);

export const handleVisit = (_req: Request, res: Response) => {
  const timestamp = timeProvider.getCurrentTimeIso();

  // IP –> Country
  const ip =
    _req.headers['x-forwarded-for'] ||
    _req.socket.remoteAddress ||
    (_req.ip as string);

  const geo = geoip.lookup(ip as string);
  const country = geo?.country;

  // User Agent –> Browser, OS, Device Type
  const parser = new UAParser();
  const result = parser.setUA(_req.headers['user-agent'] || '').getResult();
  const browser = result.browser.name;
  const os = result.os.name;
  const deviceType = result.device.type;

  const language = _req.headers['accept-language']?.split(',')[0];

  const referrer = _req.headers['referer'] || 'Direct';

  const screen = _req.query.screen as string | undefined;

  counterService.recordVisit({
    timestamp,
    country,
    browser,
    os,
    deviceType,
    language,
    referrer,
    screen,
  });
  res.send('done');
};

export const getVisitCounts = (_req: Request, res: Response) => {
  const result = counterService.getVisitCounts();
  res.send(result);
};
