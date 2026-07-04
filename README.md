# ⚡ Claude Code Gateway Switcher

A standalone, local API Gateway switcher and model browser built specifically for **Claude Code**. Easily switch between 12+ AI model providers (including NVIDIA NIM, OpenRouter, Agent Router, Aerolink, and Gemini) with a single click, directly writing configurations to your Claude settings file.

---

## ✨ Features

- **One-Click Gateway Switcher:** Automatically writes your selected provider config to `~/.claude/settings.json`.
- **Live Model Browser:** Fetches live free (and paid) models dynamically from target endpoints, bypassing CORS using a local backend proxy.
- **Connection Testing:** Instantly test API key status and balance limits before applying configurations.
- **Preconfigured Providers:**
  - 🚀 **Agent Router** (Claude Opus 4.8, GPT-5, DeepSeek V3.1)
  - ✈️ **Aerolink** (Claude Opus 4.6, Claude Sonnet)
  - 🧠 **FreeModel AI** (Claude Opus, Claude Sonnet)
  - 🌐 **OpenRouter** (100+ models - DeepSeek, Llama, Qwen)
  - 🟢 **NVIDIA NIM** (Nemotron, DeepSeek, Llama, Qwen, Kimi, GLM)
  - ✦ **Google Gemini** (Gemini 2.0 Flash, 1.5 Pro)
  - ⚡ **Groq** (Ultra-fast Distill models)
  - 🧩 **Cerebras** (Wafer-scale speed Llama)
  - 🐙 **GitHub Models** (Free GPT-4o, Llama 405B, DeepSeek-R1)
  - 🌬️ **Mistral** (Mistral Large, Codestral)
  - 🤗 **Hugging Face** (Serverless router endpoints)
  - 🪂 **Chutes AI** (Decentralized inference)
  - ⚙️ **Custom Gateway** (Any Anthropic/OpenAI-compatible URL)
- **Modern Swiss Typographic UI:** A sleek, minimal design with gradients and JetBrains Mono fonts.

---

## 📦 Getting Started (Local Run)

### 1. Download & Install
Clone or download this repository to your computer, open a terminal in the folder, and install dependencies:

```bash
# Navigate to the folder
cd claude-gateway-switcher

# Install dependencies (only Express.js is required)
npm install
```

### 2. Start the Switcher Server
Run the local backend server:

```bash
npm run dev
```

You should see output similar to this:
```
  ⚡ Free Model Gateway Hub running at:
  → http://localhost:3847

  📁 Config path: /Users/username/.claude/settings.json
```

### 3. Switch Gateways
1. Open **[http://localhost:3847](http://localhost:3847)** in your browser.
2. Select your gateway (e.g., *NVIDIA NIM*, *OpenRouter*, *Aerolink*, etc.).
3. Enter your **API Key** (links to get free keys are provided directly on each card).
4. Hit **"Test Connection"** to verify if the key is valid and has balance.
5. Click **"Apply to Claude Code"** (only supported for Anthropic-compatible format gateways).
6. **Restart Claude Code** in your terminal:
   ```bash
   claude
   ```
7. That's it! Your Claude Code CLI is now using your selected provider. 🎉

---

## 🔧 Behind the Scenes

The local Express server hosts standard static files and handles backend operations:
- `GET /api/config` — Reads `~/.claude/settings.json`.
- `POST /api/config` — Updates `~/.claude/settings.json` with chosen API key, base URL, and model.
- `GET /api/models` — Queries model catalogs from provider endpoints.
- `GET /api/test` — Verifies connections to the selected provider.
