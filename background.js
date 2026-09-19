// Glim — Background Service Worker
// Handles: toolbar toggle, tab screenshot, Claude API, ElevenLabs TTS.

'use strict';

// Model ID. claude-sonnet-4-20250514 was RETIRED on 15 June 2026 and no longer works.
// claude-sonnet-5 is current; Anthropic guarantees it until at least 30 June 2027.
// To swap later, change this one line only. See:
// https://platform.claude.com/docs/en/about-claude/model-deprecations
const CLAUDE_MODEL = 'claude-sonnet-5';
const CLAUDE_URL   = 'https://api.anthropic.com/v1/messages';
const EL_URL       = 'https://api.elevenlabs.io/v1/text-to-speech';

// ── Jarvis-style system prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Glim, an intelligent AI assistant embedded in the user's browser — precise, fast, and capable, like Jarvis from Iron Man.

You can see exactly what is on the user's screen through screenshots they share with you.

Your personality:
→ Calm, confident, and direct
→ Speaks concisely — no filler, no preamble
→ Always specific to what you see on screen
→ Never says you cannot see the screen
→ Feels like a brilliant colleague sitting next to the user
→ Warm but efficient — never wastes words

Response rules:
→ Keep responses to 3 sentences maximum unless more detail is specifically requested
→ Start every response directly — no "Of course!", "Sure!", "Great question!" or similar
→ Be specific: reference exact things you see on the page
→ If asked to summarise, use bullet points
→ If you see an error, diagnose it immediately and give the fix`;

// ── Toolbar icon click → toggle sidebar ──────────────────────────────────────
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'GLIM_TOGGLE' });
  } catch (_) {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js', 'sidebar.js'] });
    } catch (err) {
      console.warn('Glim: could not inject on this page —', err.message);
    }
  }
});

// ── Message router ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {

  // ── Screenshot ──────────────────────────────────────────────────────────────
  if (msg.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 90 }, dataUrl => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }
      if (!dataUrl?.startsWith('data:image/')) {
        sendResponse({ error: 'Screenshot returned invalid data.' });
        return;
      }
      sendResponse({ screenshot: dataUrl });
    });
    return true;
  }

  // ── Claude API ──────────────────────────────────────────────────────────────
  if (msg.action === 'claudeApiCall') {
    callClaude(msg.payload)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  // ── ElevenLabs TTS ──────────────────────────────────────────────────────────
  // Returns { audioBase64: string } or { error: string }
  if (msg.action === 'elevenLabsTts') {
    elevenLabsTts(msg.payload)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

// ── Claude API ────────────────────────────────────────────────────────────────
async function callClaude({ apiKey, messages, screenshotDataUrl, fileData }) {
  const builtMessages = buildMessages(messages, screenshotDataUrl, fileData);

  const res = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: builtMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude.');
  return { content: text };
}

// ── Build Claude messages with vision content ─────────────────────────────────
function buildMessages(history, screenshotDataUrl, fileData) {
  if (!history.length) return [];

  const prior = history.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
  const last  = history[history.length - 1];

  if (last.role !== 'user') {
    return [...prior, { role: last.role, content: last.content }];
  }

  const parts = [];

  if (screenshotDataUrl) {
    const base64 = screenshotDataUrl.split(',')[1];
    const mime   = (screenshotDataUrl.match(/^data:([^;]+);/) || [])[1] || 'image/png';
    parts.push({ type: 'image', source: { type: 'base64', media_type: mime, data: base64 } });
  } else if (fileData) {
    const base64 = fileData.dataUrl.split(',')[1];
    if (fileData.kind === 'image') {
      parts.push({ type: 'image',    source: { type: 'base64', media_type: fileData.mimeType, data: base64 } });
    } else if (fileData.kind === 'pdf') {
      parts.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } });
    }
  }

  if (parts.length) {
    parts.push({ type: 'text', text: last.content });
    return [...prior, { role: 'user', content: parts }];
  }
  return [...prior, { role: 'user', content: last.content }];
}

// ── ElevenLabs TTS ────────────────────────────────────────────────────────────
// Fetches audio/mpeg from ElevenLabs and returns it as a base64 string so it
// can be passed through chrome.runtime.sendMessage (which can't transfer Blobs).
async function elevenLabsTts({ apiKey, voiceId, text }) {
  const res = await fetch(`${EL_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept':       'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key':   apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.75, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || `ElevenLabs error ${res.status}`);
  }

  const buffer = await res.arrayBuffer();
  // Convert ArrayBuffer → base64 string for message passing
  const bytes  = new Uint8Array(buffer);
  let binary   = '';
  // Process in chunks to avoid call stack overflow on large buffers
  const CHUNK  = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return { audioBase64: btoa(binary) };
}
