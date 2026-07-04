// ═══════════════════════════════════════════════════════════════
//  Free Model Gateway Hub — Frontend
//  • Browse LIVE free model lists from each gateway (server proxy)
//  • Pick a model per gateway, apply Anthropic-native ones to Claude Code
// ═══════════════════════════════════════════════════════════════

// ─── Free-model detectors ───
const allFree = () => true;
const openrouterFree = (m) => {
  if (m.id && m.id.endsWith(':free')) return true;
  if (m.pricing) {
    const p = parseFloat(m.pricing.prompt || 0);
    const c = parseFloat(m.pricing.completion || 0);
    return p === 0 && c === 0;
  }
  return false;
};

// Keep only chat / coding / reasoning text models — drop OCR, TTS, ASR,
// image, video, embedding, rerank, safety/guard, biology endpoints. Used so
// gateways like NVIDIA NIM (which host hundreds of non-LLM models) stay clean
// even after a live "Update", showing only models you can actually chat with.
const NON_TEXT = /embed|rerank|reranker|ocr|parse|nemoretriever|asr|tts|whisper|canary|parakeet|riva|magpie|conformer|megatron-1b-nmt|voicechat|studio.?voice|noise|guard|safety|jailbreak|content.?safety|gliner|topic-control|vista|molmim|genmol|diffdock|rfdiffusion|proteinmpnn|esm|alphafold|openfold|boltz|evo2|fourcastnet|cosmos|flux|stable-diffusion|sdxl|qwen-image|paligemma|trellis|bge|paddleocr|yolox|page-elements|table-structure|graphic-elements|eyecontact|lipsync|speaker|streampetr|bevformer|sparsedrive|cuopt|fastpitch|relight|synthetic-video|diffusiongemma/i;
const textOnly = (m) => !NON_TEXT.test(m.id || '');

// helper to make {id,name} static fallback lists
const M = (...ids) => ids.map((id) => ({ id, name: id, pricing: null }));

// ═══════════════════════════════════════════════════════════════
//  Gateways
//   format:    anthropic | openai | gemini  (how we talk to /v1)
//   claudeCode true → can write directly into ~/.claude/settings.json
//   isFree:    filter applied to the live model list
// ═══════════════════════════════════════════════════════════════
const PROVIDERS = [
  {
    id: 'agentrouter', name: 'Agent Router', sub: 'agentrouter.org', icon: '🚀',
    accent: '#8b5cf6', glow: 'rgba(139,92,246,.14)',
    format: 'anthropic', claudeCode: true,
    baseUrl: 'https://agentrouter.org/', needsAuthToken: true,
    desc: 'Multi-model gateway — Claude, GPT & DeepSeek. High free limits.',
    signup: 'https://agentrouter.org',
    defaultKey: '',
    isFree: allFree,
    staticModels: M('glm-5.2', 'claude-opus-4-8', 'claude-sonnet-4-6', 'gpt-5', 'deepseek-v3.1'),
  },
  {
    id: 'aerolink', name: 'Aerolink', sub: 'capi.aerolink.lat', icon: '✈️',
    accent: '#3b82f6', glow: 'rgba(59,130,246,.14)',
    format: 'anthropic', claudeCode: true,
    baseUrl: 'https://capi.aerolink.lat/',
    desc: 'Free Claude Code gateway. Verify via Telegram bot to get a key.',
    signup: 'https://aerolink.lat',
    defaultKey: '',
    isFree: allFree,
    staticModels: M('claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'),
  },
  {
    id: 'freemodel', name: 'FreeModel AI', sub: 'cc.freemodel.dev', icon: '🧠',
    accent: '#ec4899', glow: 'rgba(236,72,153,.14)',
    format: 'anthropic', claudeCode: true,
    baseUrl: 'https://cc.freemodel.dev/',
    desc: 'Anthropic-format Claude endpoint. Free tier, no card needed.',
    signup: 'https://freemodel.dev',
    defaultKey: '',
    isFree: allFree,
    staticModels: M('claude-opus-4-8', 'claude-sonnet-4-6'),
  },
  {
    id: 'openrouter', name: 'OpenRouter', sub: 'openrouter.ai', icon: '🌐',
    accent: '#06b6d4', glow: 'rgba(6,182,212,.14)',
    format: 'openai', claudeCode: false,
    baseUrl: 'https://openrouter.ai/api/v1/',
    desc: 'Dozens of free open-source models (DeepSeek, Llama, Qwen…). List is public.',
    signup: 'https://openrouter.ai/keys',
    defaultKey: '',
    publicModels: true, // model list works without a key
    isFree: openrouterFree,
    staticModels: M(
      'deepseek/deepseek-r1:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
    ),
  },
  {
    id: 'nvidia', name: 'NVIDIA NIM', sub: 'build.nvidia.com', icon: '🟢',
    accent: '#76b900', glow: 'rgba(118,185,0,.14)',
    format: 'openai', claudeCode: false,
    baseUrl: 'https://integrate.api.nvidia.com/v1/',
    desc: 'Free hosted open models — Nemotron, DeepSeek, Qwen, GPT-OSS, GLM, Kimi, Llama. Hit Update with a key for the full live catalogue.',
    signup: 'https://build.nvidia.com',
    defaultKey: '',
    isFree: textOnly, // hide NIM's OCR/TTS/vision/biology endpoints
    staticModels: M(
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'deepseek-ai/deepseek-v4-pro',
      'deepseek-ai/deepseek-v4-flash',
      'qwen/qwen3.5-397b-a17b',
      'qwen/qwen3.5-122b-a10b',
      'qwen/qwen3-next-80b-a3b-instruct',
      'moonshotai/kimi-k2.6',
      'z-ai/glm-5.1',
      'minimaxai/minimax-m3',
      'minimaxai/minimax-m2.7',
      'stepfun-ai/step-3.7-flash',
      'meta/llama-4-maverick-17b-128e-instruct',
      'meta/llama-3.3-70b-instruct',
      'meta/llama-3.1-8b-instruct',
      'mistralai/mistral-large-3-675b-instruct-2512',
      'mistralai/mistral-medium-3.5-128b',
      'mistralai/mistral-small-4-119b-2603',
      'google/gemma-4-31b-it',
      'nvidia/nemotron-3-ultra-550b-a55b',
      'nvidia/nemotron-3-super-120b-a12b',
      'nvidia/nemotron-3-nano-30b-a3b',
      'nvidia/llama-3.3-nemotron-super-49b-v1.5',
      'nvidia/nvidia-nemotron-nano-9b-v2',
      'bytedance/seed-oss-36b-instruct',
      'sarvamai/sarvam-m',
      'microsoft/phi-4-mini-instruct',
    ),
  },
  {
    id: 'groq', name: 'Groq', sub: 'console.groq.com', icon: '⚡',
    accent: '#f55036', glow: 'rgba(245,80,54,.14)',
    format: 'openai', claudeCode: false,
    baseUrl: 'https://api.groq.com/openai/v1/',
    desc: 'Blazing-fast free inference — Llama, DeepSeek-R1 distill, Qwen.',
    signup: 'https://console.groq.com/keys',
    defaultKey: '',
    isFree: allFree,
    staticModels: M(
      'llama-3.3-70b-versatile',
      'deepseek-r1-distill-llama-70b',
      'qwen-2.5-coder-32b',
      'llama-3.1-8b-instant',
    ),
  },
  {
    id: 'gemini', name: 'Google Gemini', sub: 'aistudio.google.com', icon: '✦',
    accent: '#4285f4', glow: 'rgba(66,133,244,.14)',
    format: 'gemini', claudeCode: false,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/',
    desc: 'Generous free tier — Gemini 2.0 Flash, 1.5 Pro & Flash.',
    signup: 'https://aistudio.google.com/apikey',
    defaultKey: '',
    isFree: allFree,
    staticModels: M('gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'),
  },
  {
    id: 'cerebras', name: 'Cerebras', sub: 'cloud.cerebras.ai', icon: '🧩',
    accent: '#ff6b35', glow: 'rgba(255,107,53,.14)',
    format: 'openai', claudeCode: false,
    baseUrl: 'https://api.cerebras.ai/v1/',
    desc: 'Ultra-fast free inference on wafer-scale chips — Llama & Qwen.',
    signup: 'https://cloud.cerebras.ai',
    defaultKey: '',
    isFree: allFree,
    staticModels: M('llama-3.3-70b', 'llama-3.1-8b', 'qwen-3-32b'),
  },
  {
    id: 'github', name: 'GitHub Models', sub: 'github.com/marketplace/models', icon: '🐙',
    accent: '#a371f7', glow: 'rgba(163,113,247,.14)',
    format: 'openai', claudeCode: false,
    baseUrl: 'https://models.inference.ai.azure.com/',
    desc: 'Free with a GitHub token — GPT-4o, Llama 405B, DeepSeek-R1.',
    signup: 'https://github.com/settings/tokens',
    defaultKey: '',
    isFree: allFree,
    staticModels: M('gpt-4o', 'gpt-4o-mini', 'Meta-Llama-3.1-405B-Instruct', 'DeepSeek-R1'),
  },
  {
    id: 'mistral', name: 'Mistral', sub: 'console.mistral.ai', icon: '🌬️',
    accent: '#fa520f', glow: 'rgba(250,82,15,.14)',
    format: 'openai', claudeCode: false,
    baseUrl: 'https://api.mistral.ai/v1/',
    desc: 'Free "La Plateforme" tier — Mistral Large, Codestral, Small.',
    signup: 'https://console.mistral.ai/api-keys',
    defaultKey: '',
    isFree: allFree,
    staticModels: M('mistral-large-latest', 'codestral-latest', 'mistral-small-latest'),
  },
  {
    id: 'huggingface', name: 'Hugging Face', sub: 'router.huggingface.co', icon: '🤗',
    accent: '#ffd21e', glow: 'rgba(255,210,30,.14)',
    format: 'openai', claudeCode: false,
    baseUrl: 'https://router.huggingface.co/v1/',
    desc: 'Serverless inference router — free monthly credits across Llama, Qwen, DeepSeek & more.',
    signup: 'https://huggingface.co/settings/tokens',
    defaultKey: '',
    isFree: textOnly,
    staticModels: M(
      'meta-llama/Llama-3.3-70B-Instruct',
      'Qwen/Qwen2.5-72B-Instruct',
      'deepseek-ai/DeepSeek-V3',
      'mistralai/Mistral-Small-24B-Instruct-2501',
    ),
  },
  {
    id: 'chutes', name: 'Chutes AI', sub: 'llm.chutes.ai', icon: '🪂',
    accent: '#00d4aa', glow: 'rgba(0,212,170,.14)',
    format: 'openai', claudeCode: false,
    baseUrl: 'https://llm.chutes.ai/v1/',
    desc: 'Decentralised free inference for open models — DeepSeek, Qwen, GLM, Kimi.',
    signup: 'https://chutes.ai',
    defaultKey: '',
    isFree: textOnly,
    staticModels: M(
      'deepseek-ai/DeepSeek-V3-0324',
      'Qwen/Qwen3-235B-A22B',
      'zai-org/GLM-4.5-Air',
      'moonshotai/Kimi-K2-Instruct',
    ),
  },
  {
    id: 'custom', name: 'Custom Gateway', sub: 'your-endpoint.com', icon: '⚙️',
    accent: '#f59e0b', glow: 'rgba(245,158,11,.14)',
    format: 'anthropic', claudeCode: true, hasCustomUrl: true,
    baseUrl: 'https://your-gateway.com/',
    desc: 'Point at any Anthropic- or OpenAI-compatible base URL.',
    signup: '',
    defaultKey: '',
    isFree: allFree,
    staticModels: M('claude-sonnet-4-6'),
  },
];

// ─── State ───
let selected = PROVIDERS[0];
const keys = {};
const chosenModel = {};            // provider id → model id
const liveModels = {};             // provider id → [{id,name,pricing}]
const loading = {};                // provider id → bool
let showPaid = {};                 // provider id → bool
let modelQuery = {};               // provider id → search string
let customUrl = localStorage.getItem('gw_custom_url') || 'https://your-gateway.com/';
let customFormat = localStorage.getItem('gw_custom_format') || 'anthropic';
let currentLiveProvider = null;

PROVIDERS.forEach((p) => {
  keys[p.id] = localStorage.getItem(`gw_key_${p.id}`) || p.defaultKey;
  chosenModel[p.id] = localStorage.getItem(`gw_model_${p.id}`) || p.staticModels[0].id;
  modelQuery[p.id] = '';
  showPaid[p.id] = false;
});

const baseOf = (p) => (p.hasCustomUrl ? customUrl : p.baseUrl);
const formatOf = (p) => (p.hasCustomUrl ? customFormat : p.format);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// models to display for a provider (live if loaded, else static), filtered free
function modelsFor(p) {
  const raw = liveModels[p.id] || p.staticModels;
  let list = showPaid[p.id] ? raw : raw.filter(p.isFree);
  const q = (modelQuery[p.id] || '').toLowerCase();
  if (q) list = list.filter((m) => (m.id + ' ' + (m.name || '')).toLowerCase().includes(q));
  return list;
}

// ─── Init ───
async function init() {
  document.getElementById('statGw').textContent = PROVIDERS.length;
  renderCards();
  renderOutput();
  updateFreeStat();
  await loadCurrentConfig();
}

async function loadCurrentConfig() {
  try {
    const res = await fetch('/api/config');
    const { config, path } = await res.json();
    if (path) document.getElementById('pathText').textContent = path;
    if (!config) return setLiveChip('No config yet — pick a gateway', false);

    const baseUrl = config.env?.ANTHROPIC_BASE_URL || '';
    const match = PROVIDERS.find((p) => p.claudeCode && norm(p.baseUrl) === norm(baseUrl));
    const model = config.env?.ANTHROPIC_MODEL;
    if (match) {
      currentLiveProvider = match.id;
      selected = match;
      if (model) chosenModel[match.id] = model;
      setLiveChip(`${match.name} — ${model || chosenModel[match.id]}`, true);
      renderCards();
      renderOutput();
    } else if (baseUrl) {
      setLiveChip(`Custom: ${baseUrl}`, true);
    }
  } catch {
    setLiveChip('Could not read config', false);
  }
}
const norm = (u) => (u && u.endsWith('/') ? u : (u || '') + '/');

function setLiveChip(text, live) {
  document.getElementById('liveText').textContent = text;
  document.getElementById('liveChip').className = live ? 'chip live' : 'chip';
}
function updateFreeStat() {
  const total = PROVIDERS.reduce((n, p) => n + modelsFor(p).length, 0);
  document.getElementById('statFree').textContent = total;
}

// ─── Render gateway cards ───
function renderCards() {
  document.getElementById('grid').innerHTML = PROVIDERS.map((p) => {
    const on = selected.id === p.id;
    const isLive = currentLiveProvider === p.id;
    const models = modelsFor(p);
    const chosen = chosenModel[p.id];
    const fmtBadge = p.format === 'anthropic' ? 'Anthropic' : p.format === 'gemini' ? 'Gemini' : 'OpenAI';
    const ccBadge = p.claudeCode
      ? `<span class="badge cc">Claude Code</span>`
      : `<span class="badge browse">Browse · API</span>`;
    // Swiss monogram from the gateway name (e.g. "NVIDIA NIM" → NN)
    const parts = p.name.replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/);
    const mono = (parts.length > 1 ? parts[0][0] + parts[1][0] : p.name.replace(/[^A-Za-z]/g, '').slice(0, 2)).toUpperCase();

    return `
    <div class="card ${on ? 'on' : ''}" style="--ac:${p.accent};--gw:${p.glow}" data-name="${esc((p.name + ' ' + p.sub).toLowerCase())}" onclick="pick('${p.id}')">
      <div class="check">✓</div>
      <div class="card-top">
        <div class="card-ico">${mono}</div>
        <div class="card-id">
          <div class="card-name">${p.name} ${isLive ? '<span class="livedot">● LIVE</span>' : ''}</div>
          <div class="card-sub">${p.sub}</div>
        </div>
      </div>

      <div class="badges">
        <span class="badge fmt">${fmtBadge}</span>
        ${ccBadge}
        <span class="badge cnt">${models.length} free model${models.length === 1 ? '' : 's'}</span>
      </div>

      <div class="card-desc">${p.desc}</div>

      <div class="model-now">
        <span class="mn-label">MODEL</span>
        <span class="mn-val" title="${esc(chosen)}">${esc(chosen)}</span>
      </div>

      ${on ? `
      <div class="picker" onclick="event.stopPropagation()">
        <div class="picker-bar">
          <input class="msearch" type="text" placeholder="Search models…" value="${esc(modelQuery[p.id])}"
                 oninput="setQuery('${p.id}', this.value)">
          <button class="btn-refresh" onclick="refreshModels('${p.id}')" ${loading[p.id] ? 'disabled' : ''}>
            ${loading[p.id] ? 'Loading…' : '↻ Update'}
          </button>
        </div>
        ${p.isFree !== allFree ? `
          <label class="paid-toggle">
            <input type="checkbox" ${showPaid[p.id] ? 'checked' : ''} onchange="togglePaid('${p.id}', this.checked)">
            show paid models too
          </label>` : ''}
        <div class="model-list">
          ${models.length ? models.map((m) => `
            <div class="mitem ${m.id === chosen ? 'sel' : ''}" onclick="chooseModel('${p.id}', '${esc(m.id)}')">
              <div class="mitem-main">
                <span class="mitem-name">${esc(m.name || m.id)}</span>
                <span class="mitem-id">${esc(m.id)}</span>
              </div>
              ${m.pricing && (parseFloat(m.pricing.prompt) > 0) ? `<span class="mtag paid">paid</span>` : `<span class="mtag free">free</span>`}
            </div>`).join('') : `<div class="empty">No models — hit ↻ Update${p.publicModels ? '' : ' after entering a key'}.</div>`}
        </div>
      </div>` : ''}

      <div class="inp-row" onclick="event.stopPropagation()">
        <input class="inp" type="password" placeholder="${p.publicModels ? 'API key (optional for list)…' : 'Enter API key…'}"
               value="${esc(keys[p.id] || '')}" oninput="setKey('${p.id}', this.value)" style="--ac:${p.accent}">
        ${p.signup ? `<a class="getkey" href="${p.signup}" target="_blank" onclick="event.stopPropagation()" title="Get a free key">key↗</a>` : ''}
      </div>
      ${p.hasCustomUrl && on ? `
      <div class="inp-row" onclick="event.stopPropagation()">
        <input class="inp" type="text" placeholder="https://your-gateway.com/" value="${esc(customUrl)}" oninput="setUrl(this.value)" style="--ac:${p.accent}">
        <select class="fmt-sel" onchange="setFmt(this.value)">
          <option value="anthropic" ${customFormat === 'anthropic' ? 'selected' : ''}>Anthropic</option>
          <option value="openai" ${customFormat === 'openai' ? 'selected' : ''}>OpenAI</option>
        </select>
      </div>` : ''}
    </div>`;
  }).join('');
}

// ─── Build config / output ───
function getConfig() {
  const p = selected;
  const key = keys[p.id] || 'YOUR_API_KEY';
  const model = chosenModel[p.id];
  const env = {
    ANTHROPIC_API_KEY: key,
    ANTHROPIC_BASE_URL: baseOf(p),
    ANTHROPIC_MODEL: model,
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
  };
  if (p.needsAuthToken) env.ANTHROPIC_AUTH_TOKEN = key;
  return { env, apiKeyHelper: `echo '${key}'` };
}
const getJSON = () => JSON.stringify(getConfig(), null, 2);

function curlSnippet() {
  const p = selected;
  const base = baseOf(p);
  const key = keys[p.id] ? keys[p.id] : 'YOUR_API_KEY';
  const model = chosenModel[p.id];
  if (formatOf(p) === 'gemini') {
    return `curl "${base}models/${model}:generateContent?key=${key}" \\\n  -H 'Content-Type: application/json' \\\n  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'`;
  }
  return `curl ${base}chat/completions \\\n  -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"${model}","messages":[{"role":"user","content":"Hello"}]}'`;
}

function renderOutput() {
  const p = selected;
  const outTitle = document.getElementById('outTitle');
  const applyBtn = document.getElementById('applyBtn');
  const termTitle = document.getElementById('termTitle');
  const jsonOut = document.getElementById('jsonOut');
  const termOut = document.getElementById('termOut');

  if (p.claudeCode) {
    outTitle.textContent = '📄 settings.json preview';
    applyBtn.disabled = false;
    applyBtn.style.display = '';
    applyBtn.textContent = '🚀 Apply to Claude Code';
    termTitle.textContent = 'zsh — Claude Code';
    jsonOut.innerHTML = getJSON()
      .replace(/"([^"]+)":/g, '<span class="k">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span class="s">"$1"</span>')
      .replace(/[{}[\]]/g, '<span class="b">$&</span>');
    termOut.innerHTML = `<span class="cm"># Applied → restart Claude Code to use ${p.name} (${esc(chosenModel[p.id])})</span>\n<span class="pr">$</span> claude`;
  } else {
    outTitle.textContent = `🔌 Use ${p.name} · ${esc(chosenModel[p.id])}`;
    applyBtn.disabled = true;
    applyBtn.style.display = 'none';
    termTitle.textContent = `${formatOf(p) === 'gemini' ? 'Gemini' : 'OpenAI'}-format — copy & use anywhere`;
    jsonOut.innerHTML =
      `<span class="cm"># Base URL</span>\n${esc(baseOf(p))}\n\n<span class="cm"># Model</span>\n${esc(chosenModel[p.id])}\n\n<span class="cm"># Not Anthropic-format — use via the API below or a router (e.g. claude-code-router).</span>`;
    termOut.innerHTML = `<span class="cm"># quick test</span>\n<span class="pr">$</span> ${esc(curlSnippet()).replace(/\n/g, '\n  ')}`;
  }
  document.getElementById('testResult').className = 'test-result';
}

// ─── Live model fetch ───
async function refreshModels(id) {
  const p = PROVIDERS.find((x) => x.id === id);
  if (loading[id]) return;
  if (!keys[id] && !p.publicModels) {
    toast('🔑 Enter an API key first to load live models', 'err');
    return;
  }
  loading[id] = true;
  renderCards();
  try {
    const q = new URLSearchParams({ url: baseOf(p), key: keys[id] || '', format: formatOf(p) });
    const res = await fetch(`/api/models?${q}`);
    const data = await res.json();
    if (data.ok) {
      liveModels[id] = data.models;
      const free = data.models.filter(p.isFree).length;
      // keep chosen model if still present, else default to first free
      const visible = showPaid[id] ? data.models : data.models.filter(p.isFree);
      if (!visible.some((m) => m.id === chosenModel[id]) && visible[0]) {
        chosenModel[id] = visible[0].id;
        localStorage.setItem(`gw_model_${id}`, chosenModel[id]);
      }
      toast(`✅ ${p.name}: ${free} free of ${data.count} models`, 'ok');
    } else {
      toast(`⚠️ ${p.name}: ${(data.error || 'fetch failed').slice(0, 80)}`, 'err');
    }
  } catch (err) {
    toast(`❌ ${err.message}`, 'err');
  } finally {
    loading[id] = false;
    renderCards();
    renderOutput();
    updateFreeStat();
  }
}

// ─── Handlers ───
function pick(id) {
  selected = PROVIDERS.find((p) => p.id === id);
  renderCards();
  renderOutput();
  // auto-load live models on first open if we can
  if (!liveModels[id] && (keys[id] || selected.publicModels)) refreshModels(id);
}
function chooseModel(id, modelId) {
  chosenModel[id] = modelId;
  localStorage.setItem(`gw_model_${id}`, modelId);
  renderCards();
  if (selected.id === id) renderOutput();
}
function setKey(id, val) {
  keys[id] = val;
  localStorage.setItem(`gw_key_${id}`, val);
  if (selected.id === id) renderOutput();
}
function setQuery(id, val) {
  modelQuery[id] = val;
  renderCards();
}
function togglePaid(id, val) {
  showPaid[id] = val;
  renderCards();
  updateFreeStat();
}
function setUrl(val) {
  customUrl = val;
  localStorage.setItem('gw_custom_url', val);
  if (selected.id === 'custom') renderOutput();
}
function setFmt(val) {
  customFormat = val;
  localStorage.setItem('gw_custom_format', val);
  if (selected.id === 'custom') renderOutput();
}
function filterGateways(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('.card').forEach((c) => {
    c.style.display = !q || c.dataset.name.includes(q) ? '' : 'none';
  });
}

// ─── Apply (Claude Code only) ───
async function applyConfig() {
  if (!selected.claudeCode) return;
  const btn = document.getElementById('applyBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Applying…';
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: getConfig() }),
    });
    const data = await res.json();
    if (data.success) {
      currentLiveProvider = selected.id;
      setLiveChip(`${selected.name} — ${chosenModel[selected.id]}`, true);
      renderCards();
      toast(`✅ Applied! Restart Claude Code → ${selected.name} · ${chosenModel[selected.id]}`, 'ok');
    } else {
      toast('❌ Failed: ' + (data.error || 'Unknown error'), 'err');
    }
  } catch (err) {
    toast('❌ Server error: ' + err.message, 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Apply to Claude Code';
  }
}

// ─── Test connection ───
async function testConnection() {
  const el = document.getElementById('testResult');
  el.className = 'test-result run';
  el.textContent = '⏳ Testing connection…';
  const p = selected;
  try {
    const q = new URLSearchParams({
      url: baseOf(p), key: keys[p.id] || '', format: formatOf(p), model: chosenModel[p.id],
    });
    const res = await fetch(`/api/test?${q}`);
    const data = await res.json();
    if (data.status >= 200 && data.status < 300) {
      const bodyText = data.body || '';
      if (bodyText.includes('Please use Claude Code CLI')) {
        el.className = 'test-result fail';
        el.textContent = `⚠️ Gateway block: "Please use Claude Code CLI". (This endpoint will only work when queried from the actual Claude Code terminal).`;
      } else if (bodyText.includes('Insufficient balance') || bodyText.includes('Insufficient credits') || bodyText.includes('insufficient_credits') || bodyText.includes('payment_required') || bodyText.includes('402')) {
        el.className = 'test-result fail';
        el.textContent = `❌ Insufficient Balance! This API key has 0 credits. Please top up your account.`;
      } else {
        el.className = 'test-result pass';
        el.textContent = `✅ ${p.name} reachable (HTTP ${data.status}) — ${chosenModel[p.id]} responded.`;
      }
    } else if (data.status > 0) {
      const bodyText = data.body || '';
      if (bodyText.includes('Insufficient balance') || bodyText.includes('Insufficient credits') || bodyText.includes('insufficient_credits') || bodyText.includes('payment_required') || bodyText.includes('402')) {
        el.className = 'test-result fail';
        el.textContent = `❌ Insufficient Balance! This API key has 0 credits. Please top up your account.`;
      } else {
        el.className = 'test-result fail';
        el.textContent = `⚠️ HTTP ${data.status} — ${bodyText.substring(0, 160) || 'see response'}`;
      }
    } else {
      el.className = 'test-result fail';
      el.textContent = `❌ ${data.error || 'connection failed'}`;
    }
  } catch (err) {
    el.className = 'test-result fail';
    el.textContent = `❌ ${err.message}`;
  }
}

// ─── Copy / toast ───
function copyJSON() {
  navigator.clipboard.writeText(selected.claudeCode ? getJSON() : curlSnippet());
  toast(selected.claudeCode ? '📋 Config copied!' : '📋 curl copied!', 'ok');
}
function toast(msg, type) {
  const el = document.getElementById('toast');
  document.getElementById('toastTxt').textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => (el.className = `toast ${type}`), 3000);
}

init();
