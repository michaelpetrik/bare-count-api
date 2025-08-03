import { Request, Response } from 'express';
import { CounterService } from '../services/counterService';
import { ActionService } from '../services/actionService';
import { JsonStore } from '../storage/jsonStore';
import { DefaultTimeProvider } from '../services/implementations/defaultTimeProvider';
import { IdGenerator } from '../utils/idGenerator';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

// Create shared instances to avoid recreation on each request
const jsonStore = new JsonStore();
const timeProvider = new DefaultTimeProvider();
const counterService = new CounterService(jsonStore, timeProvider);
const actionService = new ActionService(jsonStore, timeProvider);

export const handleHit = (_req: Request, res: Response) => {
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

  // Generate enterprise-level unique session ID for visit
  const sessionId = IdGenerator.generateSessionId();

  counterService.recordVisit({
    sessionId,
    timestamp,
    country,
    browser,
    os,
    deviceType,
    language,
    referrer,
    screen,
  });

  // Return sessionId so frontend can store it
  res.json({
    success: true,
    sessionId: sessionId,
    message: 'Visit recorded successfully',
  });
};

export const getHitStats = (_req: Request, res: Response) => {
  const result = counterService.getVisitCounts();
  res.send(result);
};

// Action tracking endpoints
export const trackAction = (req: Request, res: Response) => {
  const timestamp = timeProvider.getCurrentTimeIso();

  const {
    name,
    type,
    timeToAction,
    sessionId: providedSessionId,
    elementId,
    elementClass,
    scrollPosition,
    ...additionalParams
  } = req.body;

  // Validate required parameters
  if (!name || !type || typeof timeToAction !== 'number') {
    return res.status(400).json({
      error:
        'Missing required parameters: name, type, and timeToAction are required',
    });
  }

  if (!elementId || !elementClass || typeof scrollPosition !== 'number') {
    return res.status(400).json({
      error:
        'Missing required parameters: elementId, elementClass, and scrollPosition are required',
    });
  }

  // Use provided sessionId or generate new enterprise-level UUID
  const sessionId = providedSessionId || IdGenerator.generateSessionId();

  // Record the action with all required and provided data
  actionService.recordAction({
    sessionId,
    timestamp,
    name,
    type,
    timeToAction,
    elementId,
    elementClass,
    scrollPosition,
    url: req.headers['referer'],
    ...additionalParams, // spread any additional optional parameters
  });

  res.json({
    success: true,
    sessionId: sessionId,
    message: 'Action tracked successfully',
  });
};

export const getActionStats = (_req: Request, res: Response) => {
  const stats = actionService.getActionStats();
  res.json(stats);
};

export const getActions = (req: Request, res: Response) => {
  const { type, name, startDate, endDate } = req.query;

  let actions = actionService.getAllActions();

  // Apply filters if provided
  if (type) {
    actions = actionService.getActionsByType(type as string);
  }

  if (name) {
    actions = actionService.getActionsByName(name as string);
  }

  if (startDate && endDate) {
    actions = actionService.getActionsByDateRange(
      startDate as string,
      endDate as string
    );
  }

  res.json(actions);
};
