#!/usr/bin/env node
/**
 * Ian James MCP Server
 * Exposes publish_musing and publish_daily as MCP tools.
 *
 * Usage: node mcp-server.js
 * Env:   IJ_API_URL   – base URL of the site (default: https://ianjamesormo-com-production.up.railway.app)
 *        IJ_API_KEY   – your API key
 */

const readline = require('readline');

const API_URL = (process.env.IJ_API_URL || 'https://ianjamesormo-com-production.up.railway.app').replace(/\/$/, '');
const API_KEY = process.env.IJ_API_KEY || '';

// ── MCP Protocol helpers ──────────────────────────────────────────────────────

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function ok(id, content) {
  send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: content }] } });
}

function err(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

// ── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'publish_musing',
    description: 'Publish a new musing (essay) to ianjamesormo.com. It will appear live immediately and be committed to the repo.',
    inputSchema: {
      type: 'object',
      required: ['num', 'date', 'title', 'sub', 'time', 'tag', 'quote', 'body'],
      properties: {
        num:   { type: 'string', description: 'Zero-padded number e.g. "015"' },
        date:  { type: 'string', description: 'Display date e.g. "Apr 22 · 2026"' },
        title: { type: 'string', description: 'Essay title' },
        sub:   { type: 'string', description: 'One-line subtitle / hook' },
        time:  { type: 'string', description: 'Read time e.g. "7 min"' },
        tag:   { type: 'string', description: 'Category tag e.g. "Grace", "Work", "Faith", "Marriage", "Body", "Memoir", "Presence"' },
        quote: { type: 'string', description: 'Pull quote (one sentence)' },
        body:  { type: 'array', items: { type: 'string' }, description: 'Array of paragraph strings' },
      },
    },
  },
  {
    name: 'publish_daily',
    description: 'Publish a new daily devotional to ianjamesormo.com. It becomes today\'s featured devotional immediately.',
    inputSchema: {
      type: 'object',
      required: ['day', 'date', 'title', 'verse', 'quote', 'body'],
      properties: {
        day:   { type: 'string', description: 'Day number e.g. "048"' },
        date:  { type: 'string', description: 'Full date e.g. "April 22, 2026"' },
        title: { type: 'string', description: 'Devotional title' },
        verse: { type: 'string', description: 'Scripture reference e.g. "Proverbs 4:23"' },
        quote: { type: 'string', description: 'Pull quote (one sentence)' },
        body:  { type: 'string', description: 'Full devotional text. Use \\n\\n to separate paragraphs.' },
      },
    },
  },
  {
    name: 'list_musings',
    description: 'List all published musings.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_daily',
    description: 'List all published daily devotionals.',
    inputSchema: { type: 'object', properties: {} },
  },
];

// ── API calls ─────────────────────────────────────────────────────────────────

async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { ok: false, error: text }; }
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { error: text }; }
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function handleTool(name, args) {
  switch (name) {
    case 'publish_musing': {
      const result = await apiPost('/api/content/musing', args);
      return `✅ Musing published!\nNo. ${args.num} — "${args.title}"\nLive at: ${API_URL}/musings.html`;
    }
    case 'publish_daily': {
      const result = await apiPost('/api/content/daily', args);
      return `✅ Daily devotional published!\nDay ${args.day} — "${args.title}"\nLive at: ${API_URL}/daily.html`;
    }
    case 'list_musings': {
      const data = await apiGet('/api/content/musings');
      const list = data.map(e => `  No.${e.num} [${e.tag}] "${e.title}" — ${e.date}`).join('\n');
      return `${data.length} musings:\n${list}`;
    }
    case 'list_daily': {
      const data = await apiGet('/api/content/daily');
      const list = data.map(d => `  Day ${d.day}${d.today ? ' ★ TODAY' : ''} "${d.title}" — ${d.date}`).join('\n');
      return `${data.length} devotionals:\n${list}`;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── MCP message router ────────────────────────────────────────────────────────

async function handle(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return send({
      jsonrpc: '2.0', id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'ian-james-content', version: '1.0.0' },
      },
    });
  }

  if (method === 'tools/list') {
    return send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    try {
      const text = await handleTool(name, args || {});
      ok(id, text);
    } catch (e) {
      err(id, -32000, e.message);
    }
    return;
  }

  // Unknown method — return empty result so client doesn't hang
  send({ jsonrpc: '2.0', id, result: {} });
}

// ── Stdio transport ───────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on('line', async line => {
  line = line.trim();
  if (!line) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  await handle(msg);
});

process.stderr.write('Ian James MCP server ready\n');
