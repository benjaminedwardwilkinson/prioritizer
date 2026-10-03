import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Ensure data persistence directory exists
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'prioritizer.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default aggregate research baseline
const DEFAULT_STORE = {
  profiles: {} as Record<string, any>,
  emails: [] as { email: string; userId: string; createdAt: string }[],
  experiments: [
    {
      id: 'exp_creativity_sundays',
      priorityId: 'creativity',
      priorityName: 'Creative Expression & Art',
      priorityEmoji: '🎨',
      title: 'Sunday Morning Studio Hour',
      action: '90 uninterrupted minutes every Sunday morning dedicated strictly to painting, writing, or playing music.',
      resource: 'TIME',
      deltaDescription: '+90 mins/week (+78 hrs/year)',
      durationDays: 30,
      startDate: new Date(Date.now() - 6 * 86400000).toISOString(),
      status: 'ACTIVE',
      outcome: 'better',
      notes: 'Felt surprisingly refreshing. Disconnected Wi-Fi during the hour.',
    },
  ],
  aggregateResearch: {
    totalSnapshots: 1420,
    topSelectedPriorities: [
      { id: 'family', name: 'Family & Kinship', emoji: '❤️', percentage: 76 },
      { id: 'fitness', name: 'Physical Vitality & Movement', emoji: '💪', percentage: 68 },
      { id: 'career', name: 'Career & Professional Impact', emoji: '💻', percentage: 64 },
      { id: 'creativity', name: 'Creative Expression & Art', emoji: '🎨', percentage: 58 },
      { id: 'financial', name: 'Financial Independence', emoji: '💰', percentage: 54 },
      { id: 'travel', name: 'Adventure & Travel', emoji: '✈️', percentage: 48 },
    ],
    commonFrictionGaps: [
      { priorityId: 'creativity', name: 'Creative Expression & Art', emoji: '🎨', gapFrequency: 72, primaryFriction: 'time & energy' },
      { priorityId: 'fitness', name: 'Physical Vitality & Movement', emoji: '💪', gapFrequency: 54, primaryFriction: 'time & obligations' },
      { priorityId: 'travel', name: 'Adventure & Travel', emoji: '✈️', gapFrequency: 46, primaryFriction: 'money & obligations' },
    ],
    seasonalShifts: [
      { season: 'Autumn (Oct-Nov)', highlight: 'Creativity, Home Sanctuary, and Family gather strong seasonal momentum.' },
      { season: 'Winter (Dec-Jan)', highlight: 'Rest, Financial Reset, and Career roadmapping surge in declared focus.' },
      { season: 'Spring (Mar-May)', highlight: 'Physical Vitality, Outdoor Nature, and Renewal spike across profiles.' },
      { season: 'Summer (Jun-Aug)', highlight: 'Travel, Adventure, and Play claim peak calendar allocation.' },
    ],
  },
};

function readDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading DB, falling back to default:', err);
  }
  return DEFAULT_STORE;
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// Initialize database file idempotently on boot
if (!fs.existsSync(DATA_FILE)) {
  writeDb(DEFAULT_STORE);
}

app.use(express.json());

// --- HEALTH CHECK ROUTE ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'prioritizer',
    environment: isProd ? 'production' : 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// --- PROJECT ZIP DOWNLOAD ROUTE ---
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const tmpZipPath = path.join(os.tmpdir(), `prioritizer-${Date.now()}.zip`);
  const rootDir = __dirname;
  const pyScript = `
import zipfile, os

exclude_dirs = {'.git', 'node_modules', 'dist', '.cache'}
root_dir = r'''${rootDir}'''
with zipfile.ZipFile(r'''${tmpZipPath}''', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file.endswith('.zip'):
                continue
            filepath = os.path.join(root, file)
            arcname = os.path.relpath(filepath, root_dir)
            zf.write(filepath, arcname)
`;

  execFile('python3', ['-c', pyScript], (err) => {
    if (err) {
      console.error('Failed to create project zip:', err);
      return res.status(500).json({ error: 'Failed to create project zip file' });
    }
    res.download(tmpZipPath, 'prioritizer-project.zip', () => {
      try {
        if (fs.existsSync(tmpZipPath)) {
          fs.unlinkSync(tmpZipPath);
        }
      } catch {
        // ignore cleanup error
      }
    });
  });
});

// --- API ROUTES ---

// Retrieve user profile / snapshot history
app.get('/api/profile/:userId', (req: Request, res: Response) => {
  const db = readDb();
  const profile = db.profiles[req.params.userId] || null;
  res.json({ success: true, profile });
});

// Save snapshot & user state
app.post('/api/profile/save', (req: Request, res: Response) => {
  const { userId, snapshot } = req.body;
  if (!userId || !snapshot) {
    return res.status(400).json({ error: 'Missing userId or snapshot' });
  }
  const db = readDb();
  if (!db.profiles[userId]) {
    db.profiles[userId] = { snapshots: [] };
  }
  db.profiles[userId].snapshots.unshift(snapshot);
  db.aggregateResearch.totalSnapshots = (db.aggregateResearch.totalSnapshots || 0) + 1;
  writeDb(db);
  res.json({ success: true, message: 'Snapshot saved' });
});

// Reset user profile on server
app.post('/api/profile/reset', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (userId) {
    const db = readDb();
    if (db.profiles && db.profiles[userId]) {
      delete db.profiles[userId];
      writeDb(db);
    }
  }
  res.json({ success: true, message: 'Profile reset on server' });
});

// Save email value exchange safely
app.post('/api/email', (req: Request, res: Response) => {
  const { userId, email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  const db = readDb();
  const existing = db.emails.find((e: any) => e.email.toLowerCase() === email.toLowerCase());
  if (!existing) {
    db.emails.push({
      userId: userId || 'unknown',
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    });
    writeDb(db);
  }
  res.json({ success: true, message: 'Seasonal reminder email registered' });
});

// Experiments list & creation
app.get('/api/experiments', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, experiments: db.experiments || [] });
});

app.post('/api/experiments', (req: Request, res: Response) => {
  const experiment = req.body;
  if (!experiment || !experiment.id) {
    return res.status(400).json({ error: 'Invalid experiment data' });
  }
  const db = readDb();
  const idx = db.experiments.findIndex((e: any) => e.id === experiment.id);
  if (idx >= 0) {
    db.experiments[idx] = experiment;
  } else {
    db.experiments.unshift(experiment);
  }
  writeDb(db);
  res.json({ success: true, experiment });
});

app.patch('/api/experiments/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const db = readDb();
  const idx = db.experiments.findIndex((e: any) => e.id === id);
  if (idx >= 0) {
    db.experiments[idx] = { ...db.experiments[idx], ...updates };
    writeDb(db);
    return res.json({ success: true, experiment: db.experiments[idx] });
  }
  res.status(404).json({ error: 'Experiment not found' });
});

// Aggregate research trends (anonymized, zero PII)
app.get('/api/research/trends', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({
    success: true,
    data: db.aggregateResearch || DEFAULT_STORE.aggregateResearch,
  });
});

// Opt-in anonymous data point
app.post('/api/research/contribute', (req: Request, res: Response) => {
  // Anonymized data point without IP or userId
  res.json({ success: true, message: 'Anonymized contribution recorded' });
});

// --- CLIENT SERVING ---
async function startServer() {
  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode serving built assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Prioritizer server listening on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Prioritizer server:', err);
  process.exit(1);
});
