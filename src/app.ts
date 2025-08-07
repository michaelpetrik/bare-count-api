import express from 'express';
import path from 'path';
import fs from 'fs';
import counterRoutes from './routes/counterRoutes';

const app = express();

// Security
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // CORS headers for tracker.js and API endpoints
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

// Rate limiting for tracking endpoints (simple in-memory implementation)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // per IP per minute

app.use((req, res, next) => {
  const ip =
    req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  const now = Date.now();
  const key = `${ip}`;

  // Skip rate limiting for tracker.js and health check gets higher limit
  if (req.path === '/tracker.js') {
    next();
    return;
  }

  const isHealthCheck = req.path === '/health';
  const maxRequests = isHealthCheck ? 300 : RATE_LIMIT_MAX_REQUESTS; // 5 requests per second for health

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const limit = rateLimitMap.get(key);
    if (now > limit.resetTime) {
      // Reset window
      limit.count = 1;
      limit.resetTime = now + RATE_LIMIT_WINDOW;
    } else {
      limit.count++;
      if (limit.count > maxRequests) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Try again later.',
        });
        return;
      }
    }
  }

  next();
});

// Cleanup rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000); // cleanup every 5 minutes

// JSON parsing with size limits
app.use(express.json({ limit: '10kb' }));

// Security: Block access to sensitive files and directories
app.use((req, res, next) => {
  const blockedExtensions = ['.json', '.ts', '.js', '.env', '.log', '.txt'];
  const blockedPaths = [
    '/data/',
    '/src/',
    '/node_modules/',
    '/.git/',
    '/storage',
  ];
  const blockedFiles = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    '.env',
  ];

  // Check for blocked extensions
  const hasBlockedExtension = blockedExtensions.some((ext) =>
    req.path.endsWith(ext)
  );

  // Check for blocked paths
  const hasBlockedPath = blockedPaths.some((path) => req.path.startsWith(path));

  // Check for specific blocked files
  const isBlockedFile = blockedFiles.some((file) => req.path.includes(file));

  // Allow tracker.js specifically
  if (req.path === '/tracker.js') {
    next();
    return;
  }

  if (hasBlockedExtension || hasBlockedPath || isBlockedFile) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  next();
});

// Serve tracker.js with proper headers
app.get('/tracker.js', (req, res) => {
  try {
    const trackerPath = path.join(__dirname, '../tracker.js');

    if (!fs.existsSync(trackerPath)) {
      res.status(404).json({ error: 'Tracker not found' });
      return;
    }

    const trackerContent = fs.readFileSync(trackerPath, 'utf8');

    // Set proper headers for JavaScript file
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate'); // 1 hour cache
    res.setHeader(
      'ETag',
      `"${Buffer.from(trackerContent).toString('base64').slice(0, 16)}"`
    );

    // Check if client has cached version
    const ifNoneMatch = req.headers['if-none-match'];
    const etag = res.getHeader('ETag');
    if (ifNoneMatch === etag) {
      res.status(304).end();
      return;
    }

    res.send(trackerContent);
  } catch (error) {
    console.error('Error serving tracker.js:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint - optimized for fast response
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Readiness check endpoint - for faster startup detection
app.get('/ready', (req, res) => {
  res.status(200).send('OK');
});

// API routes
app.use('/', counterRoutes);

export default app;
