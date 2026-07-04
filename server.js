import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3847;
const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json');

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

const norm = (u) => (u.endsWith('/') ? u : u + '/');

// ─── GET current settings.json ───
app.get('/api/config', (req, res) => {
  try {
    if (!existsSync(SETTINGS_PATH)) {
      return res.json({ config: null, path: SETTINGS_PATH });
    }
    const raw = readFileSync(SETTINGS_PATH, 'utf-8');
    const config = JSON.parse(raw);
    res.json({ config, path: SETTINGS_PATH });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST update settings.json ───
app.post('/api/config', (req, res) => {
  try {
    const { config } = req.body;
    if (!config) return res.status(400).json({ error: 'Missing config' });

    // Preserve existing permissions & effortLevel if not provided
    let existing = {};
    if (existsSync(SETTINGS_PATH)) {
      existing = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
    }

    const merged = {
      ...config,
      permissions: config.permissions || existing.permissions || { allow: [], deny: [] },
      effortLevel: config.effortLevel || existing.effortLevel || 'high',
    };

    writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
    res.json({ success: true, path: SETTINGS_PATH, config: merged });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET live model list from a provider (server-side proxy → no CORS) ───
app.get('/api/models', async (req, res) => {
  const { url, key, format = 'openai' } = req.query;
  if (!url) return res.status(400).json({ ok: false, error: 'Missing url' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const base = norm(url);
    let endpoint;
    const headers = {};

    if (format === 'gemini') {
      endpoint = `${base}models?key=${encodeURIComponent(key || '')}&pageSize=1000`;
    } else if (format === 'anthropic') {
      endpoint = `${base}v1/models`;
      if (key) headers['x-api-key'] = key;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      endpoint = `${base}models`;
      if (key) headers['Authorization'] = `Bearer ${key}`;
    }

    const r = await fetch(endpoint, { headers, signal: controller.signal });
    clearTimeout(timeout);
    const text = await r.text();

    if (!r.ok) {
      return res.json({ ok: false, status: r.status, error: text.slice(0, 300) });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.json({ ok: false, error: 'Provider did not return JSON' });
    }

    let models = [];
    if (format === 'gemini') {
      models = (data.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map((m) => ({
          id: (m.name || '').replace('models/', ''),
          name: m.displayName || m.name,
          pricing: null,
        }));
    } else {
      models = (data.data || []).map((m) => ({
        id: m.id,
        name: m.display_name || m.name || m.id,
        pricing: m.pricing || null,
        created: m.created || null,
      }));
    }

    res.json({ ok: true, count: models.length, models });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ─── GET test connection to a provider ───
app.get('/api/test', async (req, res) => {
  const { url, key, format = 'anthropic', model } = req.query;
  if (!url || !key) return res.status(400).json({ error: 'Missing url or key' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const base = norm(url);
    let endpoint, headers, body;

    if (format === 'openai') {
      endpoint = `${base}chat/completions`;
      headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
      body = JSON.stringify({
        model: model || 'gpt-4o-mini',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      });
    } else if (format === 'gemini') {
      endpoint = `${base}models/${model || 'gemini-2.0-flash'}:generateContent?key=${encodeURIComponent(key)}`;
      headers = { 'Content-Type': 'application/json' };
      body = JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] });
    } else {
      endpoint = `${base}v1/messages`;
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      };
      body = JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      });
    }

    const response = await fetch(endpoint, { method: 'POST', headers, body, signal: controller.signal });
    clearTimeout(timeout);
    const data = await response.text();
    res.json({ status: response.status, body: data });
  } catch (err) {
    res.json({ status: 0, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ⚡ Free Model Gateway Hub running at:');
  console.log(`  → http://localhost:${PORT}`);
  console.log('');
  console.log(`  📁 Config path: ${SETTINGS_PATH}`);
  console.log('');
});
