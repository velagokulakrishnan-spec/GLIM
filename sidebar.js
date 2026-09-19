// Glim — Sidebar Logic
// Waits for content.js to mount the Shadow DOM, then initialises everything.
'use strict';

(function waitForShadow() {
  if (window.__glimShadow && window.__glimRoot) {
    initGlim(window.__glimRoot, window.__glimShadow);
  } else {
    setTimeout(waitForShadow, 30);
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
function initGlim(root, shadow) {

  // ── Helpers ────────────────────────────────────────────────────────────────
  const $      = id  => shadow.getElementById(id);
  const esc    = s   => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const delay  = ms  => new Promise(r => setTimeout(r, ms));

  // ── Element refs ───────────────────────────────────────────────────────────
  const toggleBtn     = $('glim-toggle');
  const sidebar       = $('glim-sidebar');
  const header        = $('glim-header');
  const statusEl      = $('glim-status');
  const waveEl        = $('glim-wave');
  const chatView      = $('glim-chat-view');
  const settingsView  = $('glim-settings-view');
  const messagesEl    = $('glim-messages');
  const emptyEl       = $('glim-empty');
  const inputArea     = $('glim-input-area');
  const textarea      = $('glim-textarea');
  const sendBtn       = $('glim-send-btn');
  const fileBtn       = $('glim-file-btn');
  const fileInput     = $('glim-file-input');
  const camBtn        = $('glim-cam-btn');
  const micBtn        = $('glim-mic-btn');
  const filePreview   = $('glim-file-preview');
  const previewImg    = $('glim-preview-img');
  const previewDoc    = $('glim-preview-doc');
  const previewDocIco = $('glim-preview-doc-icon');
  const previewDocNm  = $('glim-preview-doc-name');
  const previewLbl    = $('glim-preview-lbl');
  const previewRm     = $('glim-preview-rm');
  const apiWarn       = $('glim-api-warn');
  const warnBtn       = $('glim-warn-btn');
  const closeBtn      = $('glim-close-btn');
  const minimizeBtn   = $('glim-minimize-btn');
  const newBtn        = $('glim-new-btn');
  const settingsBtn   = $('glim-settings-btn');
  const voiceBtn      = $('glim-voice-btn');
  const voiceOnIcon   = $('glim-voice-on-icon');
  const voiceOffIcon  = $('glim-voice-off-icon');
  const apiInput      = $('glim-api-input');
  const eyeBtn        = $('glim-eye-btn');
  const eyeShow       = $('glim-eye-show');
  const eyeHide       = $('glim-eye-hide');
  const sdot          = $('glim-sdot');
  const stext         = $('glim-stext');
  const voiceToggle   = $('glim-voice-toggle');
  const wakeToggle    = $('glim-wake-toggle');
  const saveBtn       = $('glim-save-btn');
  const clearBtn      = $('glim-clear-btn');
  const transcriptEl  = $('glim-transcript');
  const transcriptTxt = $('glim-transcript-text');
  const retryBtn      = $('glim-retry-btn');
  const voiceCardsEl  = $('glim-voice-cards');
  const elVoicesEl    = $('glim-el-voices');
  const elKeyInput    = $('glim-el-key-input');
  const elEyeBtn      = $('glim-el-eye-btn');
  const themeCardsEl    = $('glim-theme-cards');
  const cpickBgInput    = $('glim-cpick-bg');
  const cpickBgHex      = $('glim-cpick-bg-hex');
  const cpickAccentInput= $('glim-cpick-accent');
  const cpickAccentHex  = $('glim-cpick-accent-hex');
  const cpickTextInput  = $('glim-cpick-text');
  const cpickTextHex    = $('glim-cpick-text-hex');
  const cpickBubbleInput= $('glim-cpick-bubble');
  const cpickBubbleHex  = $('glim-cpick-bubble-hex');
  const colorResetBtn   = $('glim-color-reset');

  // ── Constants ──────────────────────────────────────────────────────────────
  // Web Speech style profiles (rate / pitch) — used as fallback when no EL key
  const VOICE_PROFILES = [
    { id: 'calm',         label: 'Calm & Friendly', desc: 'Warm and approachable',  rate: 0.9, pitch: 1.0, volume: 1.0, icon: '😊' },
    { id: 'professional', label: 'Professional',     desc: 'Clear and confident',    rate: 1.0, pitch: 0.9, volume: 1.0, icon: '💼' },
    { id: 'energetic',    label: 'Energetic',        desc: 'Upbeat and encouraging', rate: 1.1, pitch: 1.2, volume: 1.0, icon: '⚡' },
    { id: 'slow',         label: 'Slow & Clear',     desc: 'Easy to understand',     rate: 0.7, pitch: 1.0, volume: 1.0, icon: '🔊' },
  ];

  // ElevenLabs voice catalogue
  const EL_VOICES = [
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',   desc: 'Deep and confident',      gender: 'male'   },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh',   desc: 'Calm and clear',           gender: 'male'   },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', desc: 'Strong and authoritative', gender: 'male'   },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', desc: 'Warm and friendly',        gender: 'female' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi',   desc: 'Confident and clear',      gender: 'female' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella',  desc: 'Soft and calm',            gender: 'female' },
  ];

  // Theme catalogue — bg + dual-stop accent for the preview swatch
  const THEMES = [
    { id: 'dark-navy',       name: 'Dark Navy',      bg: '#07091a', accent: '#3b82f6', accent2: '#7c3aed' },
    { id: 'midnight-purple', name: 'Midnight Purple', bg: '#0d0720', accent: '#7c3aed', accent2: '#a855f7' },
    { id: 'forest-dark',     name: 'Forest Dark',     bg: '#0a1a0f', accent: '#22c55e', accent2: '#16a34a' },
    { id: 'sunset-dark',     name: 'Sunset Dark',     bg: '#1a0a00', accent: '#f97316', accent2: '#ea580c' },
    { id: 'pure-black',      name: 'Pure Black',      bg: '#000000', accent: '#60a5fa', accent2: '#818cf8' },
    { id: 'light-mode',      name: 'Light Mode',      bg: '#f0f4ff', accent: '#3b82f6', accent2: '#7c3aed' },
  ];

  // Full CSS-variable override per theme (injected into :host at runtime).
  // 'dark-navy' is the default — no override needed.
  const THEME_CSS = {
    'dark-navy':        '',
    'midnight-purple':  '--bg:#0d0720;--s1:#130a2a;--s2:#180d32;--s3:#1f1240;--s4:#27174e;--border:#2a1a4e;--bord2:#3d2870;--blue:#7c3aed;--violet:#a855f7;--grad:linear-gradient(135deg,#7c3aed,#a855f7);--bg-b:rgba(124,58,237,.14);--bg-v:rgba(168,85,247,.14);--text:#e8e0f4;--text2:#9b8ab5;--text3:#5f4f80;',
    'forest-dark':      '--bg:#0a1a0f;--s1:#0f2014;--s2:#132619;--s3:#182e1e;--s4:#1e3826;--border:#1e3826;--bord2:#2d5038;--blue:#22c55e;--violet:#16a34a;--grad:linear-gradient(135deg,#22c55e,#16a34a);--bg-b:rgba(34,197,94,.14);--bg-v:rgba(22,163,74,.14);--text:#e0f4e8;--text2:#8ab59a;--text3:#4f8060;',
    'sunset-dark':      '--bg:#1a0a00;--s1:#220e00;--s2:#2a1200;--s3:#351800;--s4:#401f00;--border:#3d1c00;--bord2:#5a2c00;--blue:#f97316;--violet:#ea580c;--grad:linear-gradient(135deg,#f97316,#ea580c);--bg-b:rgba(249,115,22,.14);--bg-v:rgba(234,88,12,.14);--text:#f4e8e0;--text2:#b59a8a;--text3:#80604f;',
    'pure-black':       '--bg:#000000;--s1:#080808;--s2:#101010;--s3:#181818;--s4:#202020;--border:#1e1e1e;--bord2:#2e2e2e;--blue:#60a5fa;--violet:#818cf8;--grad:linear-gradient(135deg,#60a5fa,#818cf8);--bg-b:rgba(96,165,250,.14);--bg-v:rgba(129,140,248,.14);--text:#e2e8f4;--text2:#8b9ab5;--text3:#4f6280;',
    'light-mode':       '--bg:#f0f4ff;--s1:#e8eef8;--s2:#dde5f4;--s3:#cfd9ed;--s4:#c0cfe6;--border:#c2d0e8;--bord2:#a8bcdc;--blue:#3b82f6;--violet:#7c3aed;--grad:linear-gradient(135deg,#3b82f6,#7c3aed);--bg-b:rgba(59,130,246,.1);--bg-v:rgba(124,58,237,.1);--text:#0f172a;--text2:#334155;--text3:#64748b;--green:#16a34a;--red:#dc2626;--amber:#d97706;',
  };

  const WAKE        = 'hey glim';
  const SIDEBAR_KEY = 'glim-sidebar-pos';
  const BTN_KEY     = 'glim-btn-pos';
  const HISTORY_KEY = 'glim-history';

  // ── State ──────────────────────────────────────────────────────────────────
  let isOpen        = false;
  let isLoading     = false;
  let inSettings    = false;
  let chatHistory   = [];
  let pendingShot   = null;
  let pendingFile   = null;
  let voiceEnabled  = true;
  let wakeEnabled   = false;
  let voiceActive   = false;
  let recognition   = null;
  let autoSendTimer = null;
  let wakeRec       = null;
  let wakeTimer     = null;
  let selectedStyle = 'calm';                          // Web Speech style profile id
  let elVoiceId     = 'pNInz6obpgDQGcFmaJgB';         // ElevenLabs voice id (Adam default)
  let elApiKey      = '';                              // ElevenLabs API key
  let currentAudio  = null;                            // currently playing Audio element
  let activeTheme   = 'dark-navy';                     // current theme id
  let customColors  = { bg:'', accent:'', text:'', bubble:'' }; // colour picker overrides

  // Drag state — sidebar header
  let isDragging = false, dragOX = 0, dragOY = 0;
  // Drag state — toggle button
  let isBtnDrag = false, btnOX = 0, btnOY = 0, btnMoved = false;

  // ── Load settings from storage ─────────────────────────────────────────────
  chrome.storage.local.get(
    ['glimApiKey', 'glimSettings', 'glimVoiceProfile', 'glimElApiKey', 'glimElVoiceId',
     'glimTheme', 'glimCustomColors'],
    ({ glimApiKey, glimSettings, glimVoiceProfile, glimElApiKey, glimElVoiceId,
       glimTheme, glimCustomColors: savedColors }) => {
      if (glimApiKey) {
        apiInput.value = glimApiKey;
        setApiStatus('ok', 'API key saved');
      }
      const s    = glimSettings || {};
      voiceEnabled  = s.voiceEnabled !== false;
      wakeEnabled   = s.wakeEnabled  === true;
      selectedStyle = glimVoiceProfile || 'calm';
      elVoiceId     = glimElVoiceId    || 'pNInz6obpgDQGcFmaJgB';
      elApiKey      = glimElApiKey     || '';
      if (elApiKey && elKeyInput) elKeyInput.value = elApiKey;
      if (savedColors) customColors = { bg:'', accent:'', text:'', bubble:'', ...savedColors };
      updateVoiceBtnIcon();
      setSwitch(voiceToggle, voiceEnabled);
      setSwitch(wakeToggle,  wakeEnabled);
      renderVoiceStyleCards();
      renderElVoices();
      applyTheme(glimTheme || 'dark-navy', false); // false = don't re-persist on load
      applyCustomColors();   // overlay saved custom colours on top of theme
      syncColorPickers();    // populate picker inputs with current effective values
      if (wakeEnabled) startWake();
    }
  );

  // ── Restore saved chat history ─────────────────────────────────────────────
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length) {
        chatHistory = saved;
        emptyEl.style.display = 'none';
        saved.forEach(m => renderHistoryMsg(m));
      }
    }
  } catch (_) {}

  loadSidebarPos();
  loadBtnPos();

  // ═══════════════════════════════════════════════════════════════════════════
  // OPEN / CLOSE / MINIMISE
  // ═══════════════════════════════════════════════════════════════════════════
  function openSidebar() {
    isOpen = true;
    sidebar.classList.add('open');
    toggleBtn.classList.add('hidden');
    chrome.storage.local.get('glimApiKey', ({ glimApiKey }) => {
      if (!glimApiKey && !inSettings) showSettings();
    });
    setTimeout(() => textarea.focus(), 280);
  }

  function closeSidebar() {
    isOpen = false;
    sidebar.classList.remove('open', 'positioned', 'drag-snap', 'dragging');
    sidebar.style.left = sidebar.style.top = sidebar.style.right = '';
    toggleBtn.classList.remove('hidden');
    try { localStorage.removeItem(SIDEBAR_KEY); } catch (_) {}
  }

  function minimizeSidebar() {
    isOpen = false;
    sidebar.classList.remove('open');
    toggleBtn.classList.remove('hidden');
  }

  function toggle() { isOpen ? closeSidebar() : openSidebar(); }

  closeBtn.addEventListener('click',    closeSidebar);
  minimizeBtn.addEventListener('click', minimizeSidebar);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) { closeSidebar(); e.stopPropagation(); }
  }, true);
  shadow.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeSidebar();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TOGGLE BUTTON — drag + click
  // ═══════════════════════════════════════════════════════════════════════════
  toggleBtn.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isBtnDrag = true;
    btnMoved  = false;
    const r   = toggleBtn.getBoundingClientRect();
    btnOX = e.clientX - r.left;
    btnOY = e.clientY - r.top;
    toggleBtn.classList.add('dragging');
    try { toggleBtn.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  });

  toggleBtn.addEventListener('pointermove', e => {
    if (!isBtnDrag) return;
    const sz = toggleBtn.offsetWidth || 54;
    const x  = Math.max(8, Math.min(e.clientX - btnOX, window.innerWidth  - sz - 8));
    const y  = Math.max(8, Math.min(e.clientY - btnOY, window.innerHeight - sz - 8));
    if (!btnMoved) {
      const cur = toggleBtn.getBoundingClientRect();
      if (Math.hypot(e.clientX - cur.left - btnOX, e.clientY - cur.top - btnOY) > 5) {
        btnMoved = true;
        toggleBtn.classList.add('positioned');
        toggleBtn.style.right  = 'auto';
        toggleBtn.style.bottom = 'auto';
        toggleBtn.style.left   = cur.left + 'px';
        toggleBtn.style.top    = cur.top  + 'px';
      }
    }
    if (!btnMoved) return;
    toggleBtn.style.left = x + 'px';
    toggleBtn.style.top  = y + 'px';
    e.preventDefault();
  });

  function endBtnDrag(e) {
    if (!isBtnDrag) return;
    isBtnDrag = false;
    toggleBtn.classList.remove('dragging');
    try { toggleBtn.releasePointerCapture(e.pointerId); } catch (_) {}
    if (btnMoved) {
      const x = parseFloat(toggleBtn.style.left) || 0;
      const y = parseFloat(toggleBtn.style.top)  || 0;
      try { localStorage.setItem(BTN_KEY, JSON.stringify({ x, y })); } catch (_) {}
    } else {
      openSidebar();
    }
  }
  toggleBtn.addEventListener('pointerup',     endBtnDrag);
  toggleBtn.addEventListener('pointercancel', endBtnDrag);

  function loadBtnPos() {
    try {
      const raw = localStorage.getItem(BTN_KEY);
      if (!raw) return;
      const { x, y } = JSON.parse(raw);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const sz = 54;
      const cx = Math.max(8, Math.min(x, window.innerWidth  - sz - 8));
      const cy = Math.max(8, Math.min(y, window.innerHeight - sz - 8));
      toggleBtn.classList.add('positioned');
      toggleBtn.style.left   = cx + 'px';
      toggleBtn.style.top    = cy + 'px';
      toggleBtn.style.right  = 'auto';
      toggleBtn.style.bottom = 'auto';
    } catch (_) {}
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SIDEBAR DRAG
  // ═══════════════════════════════════════════════════════════════════════════
  header.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging = true;
    const r = sidebar.getBoundingClientRect();
    dragOX = e.clientX - r.left;
    dragOY = e.clientY - r.top;
    sidebar.classList.add('positioned', 'dragging');
    sidebar.classList.remove('drag-snap');
    sidebar.style.left  = r.left + 'px';
    sidebar.style.top   = r.top  + 'px';
    sidebar.style.right = 'auto';
    try { header.setPointerCapture(e.pointerId); } catch (_) {}
  });

  header.addEventListener('pointermove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const w = sidebar.offsetWidth, h = sidebar.offsetHeight;
    const x = Math.max(8, Math.min(e.clientX - dragOX, window.innerWidth  - w - 8));
    const y = Math.max(8, Math.min(e.clientY - dragOY, window.innerHeight - h - 8));
    sidebar.style.left = x + 'px';
    sidebar.style.top  = y + 'px';
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    sidebar.classList.remove('dragging');
    try { header.releasePointerCapture(e.pointerId); } catch (_) {}
    let x = parseFloat(sidebar.style.left) || 0;
    let y = parseFloat(sidebar.style.top)  || 0;
    // Mobile: snap to nearest edge
    if (window.innerWidth < 768) {
      const w = sidebar.offsetWidth;
      const snapLeft = (x + w / 2) < window.innerWidth / 2;
      x = snapLeft ? 8 : window.innerWidth - w - 8;
      sidebar.classList.add('drag-snap');
      sidebar.style.left = x + 'px';
      setTimeout(() => sidebar.classList.remove('drag-snap'), 350);
    }
    try { localStorage.setItem(SIDEBAR_KEY, JSON.stringify({ x, y })); } catch (_) {}
  }
  header.addEventListener('pointerup',     endDrag);
  header.addEventListener('pointercancel', endDrag);

  window.addEventListener('resize', () => {
    if (!sidebar.classList.contains('positioned')) return;
    const r = sidebar.getBoundingClientRect();
    const w = sidebar.offsetWidth, h = sidebar.offsetHeight;
    const x = Math.max(8, Math.min(r.left, window.innerWidth  - w - 8));
    const y = Math.max(8, Math.min(r.top,  window.innerHeight - h - 8));
    sidebar.style.left = x + 'px';
    sidebar.style.top  = y + 'px';
  });

  function loadSidebarPos() {
    try {
      const raw = localStorage.getItem(SIDEBAR_KEY);
      if (!raw) return;
      const { x, y } = JSON.parse(raw);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const w = 360, h = Math.min(760, window.innerHeight - 32);
      const cx = Math.max(8, Math.min(x, window.innerWidth  - w - 8));
      const cy = Math.max(8, Math.min(y, window.innerHeight - h - 8));
      sidebar.classList.add('positioned');
      sidebar.style.left  = cx + 'px';
      sidebar.style.top   = cy + 'px';
      sidebar.style.right = 'auto';
    } catch (_) {}
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS PANEL
  // ═══════════════════════════════════════════════════════════════════════════
  function showSettings() {
    inSettings = true;
    chatView.hidden     = true;
    settingsView.hidden = false;
    inputArea.hidden    = true;
    settingsBtn.classList.add('active');
    setTimeout(() => apiInput.focus(), 60);
  }
  function hideSettings() {
    inSettings = false;
    chatView.hidden     = false;
    settingsView.hidden = true;
    inputArea.hidden    = false;
    settingsBtn.classList.remove('active');
    textarea.focus();
  }

  settingsBtn.addEventListener('click', () => inSettings ? hideSettings() : showSettings());
  warnBtn.addEventListener('click', () => { openSidebar(); showSettings(); });

  // Anthropic key eye toggle
  eyeBtn.addEventListener('click', () => {
    const show = apiInput.type === 'password';
    apiInput.type         = show ? 'text' : 'password';
    eyeShow.style.display = show ? 'none' : '';
    eyeHide.style.display = show ? ''     : 'none';
  });

  // ElevenLabs key eye toggle
  if (elEyeBtn && elKeyInput) {
    elEyeBtn.addEventListener('click', () => {
      elKeyInput.type = elKeyInput.type === 'password' ? 'text' : 'password';
    });
  }

  // Save all settings
  saveBtn.addEventListener('click', saveAllSettings);
  apiInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveAllSettings(); });

  function saveAllSettings() {
    const claudeKey = apiInput.value.trim();
    if (!claudeKey)                       { setApiStatus('error', 'Enter your Claude key'); return; }
    if (!claudeKey.startsWith('sk-ant-')) { setApiStatus('error', 'Key should start with sk-ant-'); return; }

    const elKey = elKeyInput ? elKeyInput.value.trim() : '';
    elApiKey = elKey;

    const settings = { voiceEnabled, wakeEnabled };
    chrome.storage.local.set({
      glimApiKey:      claudeKey,
      glimSettings:    settings,
      glimVoiceProfile: selectedStyle,
      glimElApiKey:    elKey,
      glimElVoiceId:   elVoiceId,
    }, () => {
      setApiStatus('ok', 'Saved ✓');
      apiWarn.hidden = true;
      setTimeout(hideSettings, 700);
    });
  }

  function setApiStatus(type, text) {
    sdot.className    = 'glim-sdot' + (type === 'ok' ? ' ok' : type === 'error' ? ' error' : '');
    stext.textContent = text;
  }

  voiceToggle.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    setSwitch(voiceToggle, voiceEnabled);
    updateVoiceBtnIcon();
    if (!voiceEnabled) stopAllAudio();
  });

  wakeToggle.addEventListener('click', () => {
    wakeEnabled = !wakeEnabled;
    setSwitch(wakeToggle, wakeEnabled);
    wakeEnabled ? startWake() : stopWake();
  });

  clearBtn.addEventListener('click', () => {
    chatHistory = [];
    try { localStorage.removeItem(HISTORY_KEY); } catch (_) {}
    messagesEl.innerHTML = '';
    messagesEl.appendChild(emptyEl);
    emptyEl.style.display = '';
    hideSettings();
  });

  function setSwitch(btn, on) {
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER VOICE MUTE BUTTON
  // ═══════════════════════════════════════════════════════════════════════════
  voiceBtn.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    updateVoiceBtnIcon();
    if (!voiceEnabled) stopAllAudio();
  });

  function updateVoiceBtnIcon() {
    voiceOnIcon.style.display  = voiceEnabled ? '' : 'none';
    voiceOffIcon.style.display = voiceEnabled ? 'none' : '';
    voiceBtn.title = voiceEnabled ? 'Mute voice' : 'Unmute voice';
  }

  function stopAllAudio() {
    speechSynthesis.cancel();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    hideWave();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW CHAT
  // ═══════════════════════════════════════════════════════════════════════════
  newBtn.addEventListener('click', () => {
    chatHistory = [];
    try { localStorage.removeItem(HISTORY_KEY); } catch (_) {}
    clearPending();
    messagesEl.innerHTML = '';
    messagesEl.appendChild(emptyEl);
    emptyEl.style.display = '';
    textarea.value = '';
    textarea.style.height = 'auto';
    apiWarn.hidden = true;
    updateSend();
    textarea.focus();
    stopAllAudio();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTION CHIPS
  // ═══════════════════════════════════════════════════════════════════════════
  shadow.querySelectorAll('.glim-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const t = chip.textContent;
      if (t.includes('page') || t.includes('Summarise') || t.includes('screen')) {
        textarea.value = t.replace(/^[^\w]+/, '');
        updateSend();
        textarea.focus();
      } else if (t.includes('PDF') || t.includes('image') || t.includes('Analyse')) {
        fileInput.click();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREENSHOT — hides Glim entirely before capturing to get a clean frame
  // ═══════════════════════════════════════════════════════════════════════════
  async function hiddenCapture() {
    root.style.display = 'none';
    // Wait for three animation frames + paint delay so the GPU compositor
    // flushes the Glim layer before Chrome captures the visible tab.
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
    await delay(150);
    const resp = await chrome.runtime.sendMessage({ action: 'captureScreenshot' });
    root.style.display = '';
    if (resp?.error) console.warn('[Glim] Screenshot error:', resp.error);
    return resp?.screenshot || null;
  }

  async function captureAndAttach() {
    if (pendingShot) { clearPending(); updateSend(); return; }
    clearPending();
    camBtn.classList.add('active');
    setStatus('Capturing…', 'processing');
    const dataUrl = await hiddenCapture();
    camBtn.classList.remove('active');
    setStatus('Ready', '');
    if (!dataUrl) return;
    pendingShot = dataUrl;
    pendingFile = null;
    showPreviewShot(dataUrl);
    updateSend();
  }
  camBtn.addEventListener('click', captureAndAttach);

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE UPLOAD
  // ═══════════════════════════════════════════════════════════════════════════
  fileBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    fileInput.value = '';
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl  = ev.target.result;
      const mimeType = file.type || 'application/octet-stream';
      const kind     = mimeType.startsWith('image/') ? 'image'
                     : mimeType === 'application/pdf' ? 'pdf'
                     : 'other';
      pendingFile = { dataUrl, mimeType, name: file.name, kind };
      pendingShot = null;
      showPreviewFile(pendingFile);
      updateSend();
    };
    reader.readAsDataURL(file);
  });

  function showPreviewShot(dataUrl) {
    previewImg.src            = dataUrl;
    previewImg.style.display  = 'block';
    previewDoc.style.display  = 'none';
    previewLbl.textContent    = 'Screenshot attached — Glim will see this';
    filePreview.hidden        = false;
  }

  function showPreviewFile(f) {
    if (f.kind === 'image') {
      previewImg.src           = f.dataUrl;
      previewImg.style.display = 'block';
      previewDoc.style.display = 'none';
      previewLbl.textContent   = 'Image attached';
    } else {
      previewImg.style.display  = 'none';
      previewDoc.style.display  = 'flex';
      previewDocIco.textContent = f.kind === 'pdf' ? '📄' : '📁';
      previewDocNm.textContent  = f.name;
      previewLbl.textContent    = f.kind === 'pdf' ? 'PDF attached' : 'File attached';
    }
    filePreview.hidden = false;
  }

  function clearPending() {
    pendingShot = null;
    pendingFile = null;
    filePreview.hidden = true;
    previewImg.src = '';
  }

  previewRm.addEventListener('click', () => { clearPending(); updateSend(); });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT INPUT
  // ═══════════════════════════════════════════════════════════════════════════
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    updateSend();
  });
  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener('click', sendMessage);

  function updateSend() {
    sendBtn.disabled = (!textarea.value.trim() && !pendingFile) || isLoading;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEND MESSAGE
  // ═══════════════════════════════════════════════════════════════════════════
  async function sendMessage() {
    const text = textarea.value.trim();
    if (!text && !pendingFile) return;
    if (isLoading) return;

    const { glimApiKey } = await chrome.storage.local.get('glimApiKey');
    if (!glimApiKey) { apiWarn.hidden = false; return; }
    apiWarn.hidden = true;

    const userText = text || `Please analyse this ${pendingFile?.kind === 'pdf' ? 'PDF' : pendingFile?.kind === 'image' ? 'image' : 'file'}.`;
    const file     = pendingFile;
    const preShot  = pendingShot;

    textarea.value = '';
    textarea.style.height = 'auto';
    clearPending();
    isLoading = true;
    updateSend();

    // Auto-screenshot on every text message (skip if file attached)
    let screenshot = null;
    if (!file) {
      setStatus('Capturing…', 'processing');
      screenshot = preShot || await hiddenCapture();
    }

    hideEmpty();
    if (screenshot) addShotThumb(screenshot);
    if (file)       addFileChip(file);
    addMsg('user', userText);
    chatHistory.push({ role: 'user', content: userText });
    saveHistory();

    setStatus('Thinking…', 'processing');
    const loadEl = addLoading();

    try {
      const resp = await chrome.runtime.sendMessage({
        action: 'claudeApiCall',
        payload: {
          apiKey:           glimApiKey,
          messages:         chatHistory,
          screenshotDataUrl: screenshot,
          fileData:         file ? { dataUrl: file.dataUrl, mimeType: file.mimeType, kind: file.kind } : null,
        },
      });

      loadEl.remove();

      if (resp.error) {
        addMsg('assistant', `**Error:** ${resp.error}`, true);
        setStatus('Error', 'error');
        setTimeout(() => setStatus('Ready', ''), 3000);
      } else {
        addMsg('assistant', resp.content);
        chatHistory.push({ role: 'assistant', content: resp.content });
        saveHistory();
        setStatus('Ready', '');
        if (voiceEnabled) speak(resp.content);
      }
    } catch (err) {
      loadEl.remove();
      addMsg('assistant', 'Something went wrong. Please try again.', true);
      setStatus('Error', 'error');
      setTimeout(() => setStatus('Ready', ''), 3000);
    }

    isLoading = false;
    updateSend();
    scrollBottom();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE INPUT — microphone
  // ═══════════════════════════════════════════════════════════════════════════

  // BUG FIX: mic button only starts/stops listening — never replays audio
  micBtn.addEventListener('click', () => { voiceActive ? stopVoice() : startVoice(false); });

  retryBtn.addEventListener('click', () => {
    retryBtn.hidden = true;
    setMicState('');
    hideTranscript();
    textarea.value = '';
    startVoice(false);
  });

  // autoSend=true → used by wake-word path for fully hands-free operation
  async function startVoice(autoSend) {
    if (voiceActive) { stopVoice(); return; }

    // BUG FIX 1: Cancel any ongoing TTS before opening the mic.
    // Chrome will conflict if synthesis and recognition run simultaneously.
    stopAllAudio();
    await delay(300);

    // ── Mic permission pre-check ──────────────────────────────────────────
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop()); // release immediately
      } catch (err) {
        setMicState('error');
        showTranscript(
          'Microphone blocked. In Chrome: click the 🔒 icon in the address bar → allow Microphone.',
          false, true
        );
        retryBtn.hidden = false;
        return;
      }
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { addSys('Voice input is not supported in this browser.'); return; }

    recognition = new SR();
    recognition.lang            = 'en-GB';
    recognition.continuous      = false;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      voiceActive = true;
      setMicState('listening');           // green pulsing ring
      setStatus('Listening…', 'listening');
      showTranscript('Listening…');
      retryBtn.hidden = true;
      micBtn.title = 'Stop listening';
    };

    recognition.onresult = e => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) {
        const trimmed = final.trim();
        showTranscript(trimmed, true);    // green — final result
        textarea.value = trimmed;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        updateSend();
        clearTimeout(autoSendTimer);
        autoSendTimer = setTimeout(() => {
          if (textarea.value.trim()) { hideTranscript(); sendMessage(); }
        }, autoSend ? 700 : 1800);
      } else if (interim) {
        showTranscript(interim);          // italic grey — interim
        textarea.value = interim;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      }
    };

    // BUG FIX 5: "I didn't catch that" on no-speech
    recognition.onerror = e => {
      if (e.error === 'no-speech') {
        setMicState('error');
        showTranscript("I didn't catch that — please try again.", false, true);
        retryBtn.hidden = false;
        setStatus('Ready', '');
      } else if (e.error === 'not-allowed') {
        setMicState('error');
        showTranscript(
          'Microphone access denied. Click the 🔒 icon in the address bar → allow Microphone.',
          false, true
        );
        retryBtn.hidden = false;
        setStatus('Ready', '');
      } else if (e.error !== 'aborted') {
        setMicState('error');
        showTranscript(`Voice error: ${e.error}`, false, true);
        retryBtn.hidden = false;
        setStatus('Ready', '');
      }
      voiceActive  = false;
      micBtn.title = 'Voice input';
    };

    recognition.onend = () => {
      voiceActive = false;
      if (!micBtn.classList.contains('error')) setMicState('');
      if (!textarea.value.trim()) setStatus('Ready', '');
      micBtn.title = 'Voice input';
    };

    try {
      recognition.start();
    } catch (err) {
      setMicState('error');
      showTranscript('Could not start voice input. Please try again.', false, true);
      retryBtn.hidden = false;
    }
  }

  function stopVoice() {
    voiceActive = false;
    setMicState('');
    micBtn.title = 'Voice input';
    setStatus('Ready', '');
    hideTranscript();
    if (recognition) { try { recognition.abort(); } catch (_) {} recognition = null; }
    clearTimeout(autoSendTimer);
  }

  // Mic visual state: '' = idle (grey), 'listening' = green pulse, 'error' = red
  function setMicState(state) {
    micBtn.classList.remove('listening', 'error');
    if (state) micBtn.classList.add(state);
  }

  function showTranscript(text, isFinal = false, isError = false) {
    if (!transcriptEl) return;
    transcriptEl.hidden       = false;
    transcriptTxt.textContent = text;
    transcriptEl.className    = 'glim-transcript' +
      (isError ? ' error' : isFinal ? ' final' : '');
  }
  function hideTranscript() {
    if (!transcriptEl) return;
    transcriptEl.hidden    = true;
    transcriptTxt.textContent = '';
    transcriptEl.className = 'glim-transcript';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WAKE WORD — "Hey Glim"
  // ═══════════════════════════════════════════════════════════════════════════
  function startWake() {
    if (!wakeEnabled) return;
    stopWake();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    wakeRec = r;
    r.continuous     = true;
    r.interimResults = true;
    r.lang           = 'en-GB';
    r.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.toLowerCase();
        if (t.includes(WAKE)) { r.abort(); onWake(); return; }
      }
    };
    r.onend = () => {
      // Guard: if stopWake() was called between the abort and this callback,
      // wakeRec will be null — don't restart a stale recogniser.
      if (wakeEnabled && wakeRec === r) {
        wakeTimer = setTimeout(() => {
          if (!wakeEnabled || wakeRec !== r) return;
          try { r.start(); } catch (_) { startWake(); }
        }, 400);
      }
    };
    r.onerror = e => {
      if (e.error === 'not-allowed') { wakeEnabled = false; setSwitch(wakeToggle, false); }
    };
    try { r.start(); toggleBtn.classList.add('wake-listen'); } catch (_) {}
  }

  function stopWake() {
    clearTimeout(wakeTimer);
    toggleBtn.classList.remove('wake-listen', 'wake-cmd');
    if (wakeRec) { try { wakeRec.abort(); } catch (_) {} wakeRec = null; }
  }

  // BUG FIX 2: After sidebar opens, immediately start listening hands-free.
  function onWake() {
    playChime();                              // Jarvis activation sound
    toggleBtn.classList.remove('wake-cmd');
    if (!isOpen) openSidebar();
    hideEmpty();
    addSys('Listening…');
    // 800ms: chime plays + sidebar slides in before mic opens
    setTimeout(() => startVoice(true), 800);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVATION CHIME — Web Audio API two-note ascending tone
  // ═══════════════════════════════════════════════════════════════════════════
  function playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[528, 0, 0.13], [880, 0.13, 0.28]].forEach(([freq, start, end]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0,    ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + end);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + end + 0.05);
      });
      setTimeout(() => ctx.close().catch(() => {}), 1500);
    } catch (_) {}
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUND WAVE — shown in header while Glim is speaking
  // ═══════════════════════════════════════════════════════════════════════════
  function showWave() { if (waveEl) waveEl.hidden = false; }
  function hideWave() { if (waveEl) waveEl.hidden = true;  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPEECH OUTPUT — ElevenLabs with Web Speech fallback
  // ═══════════════════════════════════════════════════════════════════════════
  async function speak(text) {
    if (!voiceEnabled || !text) return;
    const clean = stripMarkdown(text).slice(0, 600);

    if (elApiKey) {
      const ok = await speakElevenLabs(clean);
      if (ok) return;
    }
    speakWebSpeech(clean);
  }

  async function speakElevenLabs(text) {
    try {
      setStatus('Speaking…', 'speaking');
      showWave();
      const resp = await chrome.runtime.sendMessage({
        action:  'elevenLabsTts',
        payload: { apiKey: elApiKey, voiceId: elVoiceId, text },
      });
      if (resp.error) {
        console.warn('[Glim ElevenLabs]', resp.error);
        hideWave();
        setStatus('Ready', '');
        return false;
      }
      // Decode base64 → Blob → Audio
      const binary = atob(resp.audioBase64);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url  = URL.createObjectURL(blob);

      if (currentAudio) { currentAudio.pause(); URL.revokeObjectURL(currentAudio._src || ''); }
      currentAudio = new Audio(url);
      currentAudio._src = url;

      currentAudio.onended = () => {
        setStatus('Ready', '');
        hideWave();
        URL.revokeObjectURL(url);
        currentAudio = null;
      };
      currentAudio.onerror = () => {
        setStatus('Ready', '');
        hideWave();
        currentAudio = null;
      };

      currentAudio.play().catch(err => {
        // AbortError is expected if audio is stopped before it starts
        if (err.name !== 'AbortError') console.warn('[Glim] Audio play:', err.message);
        hideWave();
        setStatus('Ready', '');
        currentAudio = null;
      });
      return true;
    } catch (err) {
      console.warn('[Glim ElevenLabs]', err);
      hideWave();
      setStatus('Ready', '');
      return false;
    }
  }

  function speakWebSpeech(text) {
    speechSynthesis.cancel();
    const utt  = new SpeechSynthesisUtterance(text);
    const vp   = VOICE_PROFILES.find(v => v.id === selectedStyle) || VOICE_PROFILES[0];
    utt.rate   = vp.rate;
    utt.pitch  = vp.pitch;
    utt.volume = vp.volume;
    utt.onstart = () => { setStatus('Speaking…', 'speaking'); showWave(); };
    utt.onend   = () => { setStatus('Ready', ''); hideWave(); };
    utt.onerror = () => { setStatus('Ready', ''); hideWave(); };
    speechSynthesis.speak(utt);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WEB SPEECH STYLE CARDS
  // ═══════════════════════════════════════════════════════════════════════════
  function renderVoiceStyleCards() {
    if (!voiceCardsEl) return;
    voiceCardsEl.innerHTML = '';
    VOICE_PROFILES.forEach(vp => {
      const card = document.createElement('div');
      card.className = 'glim-voice-card' + (selectedStyle === vp.id ? ' selected' : '');
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', selectedStyle === vp.id ? 'true' : 'false');
      card.tabIndex = 0;
      card.innerHTML = `
        <span class="glim-vc-icon" aria-hidden="true">${vp.icon}</span>
        <div class="glim-vc-body">
          <div class="glim-vc-name">${esc(vp.label)}</div>
          <div class="glim-vc-desc">${esc(vp.desc)}</div>
        </div>
        <button class="glim-vc-preview" type="button"
                title="Preview" aria-label="Preview ${esc(vp.label)} voice">▶</button>
      `;
      card.addEventListener('click', e => {
        if (e.target.closest('.glim-vc-preview')) return;
        selectedStyle = vp.id;
        chrome.storage.local.set({ glimVoiceProfile: vp.id });
        renderVoiceStyleCards();
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
      card.querySelector('.glim-vc-preview').addEventListener('click', e => {
        e.stopPropagation();
        speakWebSpeech("Hi, I'm Glim. This is how I sound.");
      });
      voiceCardsEl.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELEVENLABS VOICE CARDS
  // ═══════════════════════════════════════════════════════════════════════════
  function renderElVoices() {
    if (!elVoicesEl) return;
    elVoicesEl.innerHTML = '';

    const makeGroup = (label, voices) => {
      const grp = document.createElement('div');
      grp.className = 'glim-el-group';
      const hd = document.createElement('div');
      hd.className   = 'glim-el-group-hd';
      hd.textContent = label;
      grp.appendChild(hd);
      voices.forEach(v => {
        const card = document.createElement('div');
        card.className = 'glim-el-card' + (elVoiceId === v.id ? ' selected' : '');
        card.setAttribute('role', 'radio');
        card.setAttribute('aria-checked', elVoiceId === v.id ? 'true' : 'false');
        card.tabIndex = 0;
        card.innerHTML = `
          <div class="glim-el-card-body">
            <div class="glim-el-card-name">${esc(v.name)}</div>
            <div class="glim-el-card-desc">${esc(v.desc)}</div>
          </div>
          <button class="glim-el-preview" type="button"
                  title="Preview ${esc(v.name)}" aria-label="Preview ${esc(v.name)}">▶</button>
          <span class="glim-el-check" aria-hidden="true">✓</span>
        `;
        card.addEventListener('click', e => {
          if (e.target.closest('.glim-el-preview')) return;
          elVoiceId = v.id;
          chrome.storage.local.set({ glimElVoiceId: v.id });
          renderElVoices();
        });
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });
        card.querySelector('.glim-el-preview').addEventListener('click', e => {
          e.stopPropagation();
          const key = elKeyInput ? elKeyInput.value.trim() : elApiKey;
          if (!key) {
            addSys('Add your ElevenLabs key in Settings to preview voices.');
            hideSettings();
            return;
          }
          // Save state, temporarily swap for preview, then fully restore.
          // We do NOT auto-select the voice on preview — user must click the card.
          const prevId  = elVoiceId;
          const prevKey = elApiKey;
          elVoiceId = v.id;
          elApiKey  = key;
          speakElevenLabs("Hello. I'm Glim. How can I assist you?")
            .then(() => {
              elVoiceId = prevId;           // restore — preview never auto-selects
              elApiKey  = prevKey || key;
            })
            .catch(() => {
              elVoiceId = prevId;
              elApiKey  = prevKey || key;
            });
        });
        grp.appendChild(card);
      });
      return grp;
    };

    elVoicesEl.appendChild(makeGroup('♂ Male',   EL_VOICES.filter(v => v.gender === 'male')));
    elVoicesEl.appendChild(makeGroup('♀ Female', EL_VOICES.filter(v => v.gender === 'female')));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // THEME SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  // Apply a theme by injecting / updating a :host override <style> in the shadow.
  // persist=false on the initial load so we don't write storage on every boot.
  function applyTheme(id, persist = true) {
    if (!THEMES.find(t => t.id === id)) id = 'dark-navy';
    activeTheme = id;

    // Find or create the dedicated override style element
    let el = shadow.querySelector('#glim-theme-style');
    if (!el) {
      el = document.createElement('style');
      el.id = 'glim-theme-style';
      shadow.appendChild(el);
    }

    const vars = THEME_CSS[id] || '';
    el.textContent = vars ? `:host{${vars}}` : '';

    if (persist) chrome.storage.local.set({ glimTheme: id });
    renderThemeCards();
  }

  function renderThemeCards() {
    if (!themeCardsEl) return;
    themeCardsEl.innerHTML = '';

    THEMES.forEach(t => {
      const card = document.createElement('button');
      card.className = 'glim-theme-card' + (activeTheme === t.id ? ' selected' : '');
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', String(activeTheme === t.id));
      card.setAttribute('aria-label', t.name);
      card.tabIndex = 0;
      card.innerHTML = `
        <div class="glim-tp-bg" style="background:${t.bg}">
          <div class="glim-tp-accent"
               style="background:linear-gradient(90deg,${t.accent},${t.accent2})">
          </div>
        </div>
        <div class="glim-theme-name">${esc(t.name)}</div>
      `;
      card.addEventListener('click', () => {
        applyTheme(t.id);
        syncColorPickers();  // refresh pickers to show new theme's effective colours
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
      themeCardsEl.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COLOUR PICKERS
  // ═══════════════════════════════════════════════════════════════════════════

  // Per-theme defaults for the four picker values (--s2 used as bubble default).
  const THEME_DEFAULTS = {
    'dark-navy':       { bg:'#07091a', accent:'#3b82f6', text:'#e2e8f4', bubble:'#131929' },
    'midnight-purple': { bg:'#0d0720', accent:'#7c3aed', text:'#e8e0f4', bubble:'#180d32' },
    'forest-dark':     { bg:'#0a1a0f', accent:'#22c55e', text:'#e0f4e8', bubble:'#132619' },
    'sunset-dark':     { bg:'#1a0a00', accent:'#f97316', text:'#f4e8e0', bubble:'#2a1200' },
    'pure-black':      { bg:'#000000', accent:'#60a5fa', text:'#e2e8f4', bubble:'#101010' },
    'light-mode':      { bg:'#f0f4ff', accent:'#3b82f6', text:'#0f172a', bubble:'#dde5f4' },
  };

  // Darken a #rrggbb hex by a 0-1 factor.
  function darkenHex(hex, f) {
    const r = Math.round(parseInt(hex.slice(1,3),16) * (1-f));
    const g = Math.round(parseInt(hex.slice(3,5),16) * (1-f));
    const b = Math.round(parseInt(hex.slice(5,7),16) * (1-f));
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
  }

  // Inject custom colour overrides as a :host block in a dedicated <style> tag
  // that sits after the theme override, so it always wins specificity-free.
  function applyCustomColors() {
    let el = shadow.querySelector('#glim-custom-style');
    if (!el) {
      el = document.createElement('style');
      el.id = 'glim-custom-style';
      shadow.appendChild(el);
    }
    const p = [];
    if (customColors.bg)     p.push(`--bg:${customColors.bg};`);
    if (customColors.accent) {
      const a2 = darkenHex(customColors.accent, 0.22);
      p.push(`--blue:${customColors.accent};--grad:linear-gradient(135deg,${customColors.accent},${a2});`);
    }
    if (customColors.text)   p.push(`--text:${customColors.text};`);
    if (customColors.bubble) p.push(`--bubble-bg:${customColors.bubble};`);
    el.textContent = p.length ? `:host{${p.join('')}}` : '';
  }

  // Populate picker inputs + hex readouts from the current effective values.
  // Uses THEME_DEFAULTS so no getComputedStyle needed.
  function syncColorPickers() {
    const d = THEME_DEFAULTS[activeTheme] || THEME_DEFAULTS['dark-navy'];
    const vals = {
      bg:     customColors.bg     || d.bg,
      accent: customColors.accent || d.accent,
      text:   customColors.text   || d.text,
      bubble: customColors.bubble || d.bubble,
    };
    if (cpickBgInput)     { cpickBgInput.value     = vals.bg;     cpickBgHex.textContent     = vals.bg;     }
    if (cpickAccentInput) { cpickAccentInput.value  = vals.accent; cpickAccentHex.textContent = vals.accent; }
    if (cpickTextInput)   { cpickTextInput.value    = vals.text;   cpickTextHex.textContent   = vals.text;   }
    if (cpickBubbleInput) { cpickBubbleInput.value  = vals.bubble; cpickBubbleHex.textContent = vals.bubble; }
  }

  // Wire up each picker: live preview on `input`, persist on `change`.
  [
    { input: cpickBgInput,     hex: cpickBgHex,     key: 'bg'     },
    { input: cpickAccentInput, hex: cpickAccentHex, key: 'accent' },
    { input: cpickTextInput,   hex: cpickTextHex,   key: 'text'   },
    { input: cpickBubbleInput, hex: cpickBubbleHex, key: 'bubble' },
  ].forEach(({ input, hex, key }) => {
    if (!input) return;
    input.addEventListener('input', () => {
      customColors[key] = input.value;
      hex.textContent   = input.value;
      applyCustomColors();              // instant live update
    });
    input.addEventListener('change', () => {
      chrome.storage.local.set({ glimCustomColors: { ...customColors } });
    });
  });

  // Reset — wipe custom colours and switch back to Dark Navy.
  if (colorResetBtn) {
    colorResetBtn.addEventListener('click', () => {
      customColors = { bg:'', accent:'', text:'', bubble:'' };
      applyCustomColors();
      applyTheme('dark-navy');
      chrome.storage.local.set({ glimCustomColors: customColors, glimTheme: 'dark-navy' });
      syncColorPickers();
    });
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE LISTENER (toolbar icon → background.js → here)
  // ═══════════════════════════════════════════════════════════════════════════
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === 'GLIM_TOGGLE') { toggle(); sendResponse({ ok: true }); }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UI HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  function hideEmpty() { emptyEl.style.display = 'none'; }

  function setStatus(text, cls) {
    statusEl.textContent = text;
    statusEl.className   = 'glim-status' + (cls ? ' ' + cls : '');
  }

  function addMsg(role, md, isErr = false) {
    const wrap   = document.createElement('div');
    wrap.className = `glim-msg ${role}${isErr ? ' error' : ''}`;
    const bubble = document.createElement('div');
    bubble.className = 'glim-bubble';
    bubble.innerHTML = mdRender(md);
    wrap.appendChild(bubble);

    const meta = document.createElement('div');
    meta.className = 'glim-msg-meta';
    const ts = document.createElement('span');
    ts.className   = 'glim-ts';
    ts.textContent = now();
    meta.appendChild(ts);

    if (role === 'assistant' && !isErr) {
      const copy = document.createElement('button');
      copy.className   = 'glim-copy-btn';
      copy.textContent = 'Copy';
      copy.addEventListener('click', () => {
        navigator.clipboard.writeText(md).then(() => {
          copy.textContent = 'Copied!';
          copy.classList.add('copied');
          setTimeout(() => { copy.textContent = 'Copy'; copy.classList.remove('copied'); }, 1500);
        }).catch(() => {});
      });
      meta.appendChild(copy);
    }

    wrap.appendChild(meta);
    messagesEl.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function renderHistoryMsg(m) {
    const wrap   = document.createElement('div');
    wrap.className = `glim-msg ${m.role}`;
    const bubble = document.createElement('div');
    bubble.className = 'glim-bubble';
    bubble.innerHTML = mdRender(typeof m.content === 'string' ? m.content : '…');
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
  }

  function addShotThumb(dataUrl) {
    if (!dataUrl) return;
    const wrap = document.createElement('div');
    wrap.className = 'glim-shot-wrap';
    wrap.innerHTML = `
      <div class="glim-shot-frame"><img src="${esc(dataUrl)}" alt="Screen capture"></div>
      <div class="glim-shot-label">
        <div class="glim-shot-dot"></div>
        Glim sees your screen · ${now()}
      </div>`;
    messagesEl.appendChild(wrap);
    scrollBottom();
  }

  function addFileChip(f) {
    const wrap = document.createElement('div');
    wrap.className = 'glim-file-chip';
    if (f.kind === 'image') {
      wrap.innerHTML = `<div class="glim-img-frame"><img src="${esc(f.dataUrl)}" alt="Uploaded image"></div>`;
    } else {
      const ico = f.kind === 'pdf' ? '📄' : '📁';
      wrap.innerHTML = `<div class="glim-doc-chip">
        <span class="glim-doc-ico">${ico}</span>
        <span class="glim-doc-name">${esc(f.name)}</span>
      </div>`;
    }
    messagesEl.appendChild(wrap);
    scrollBottom();
  }

  function addSys(text) {
    const el = document.createElement('div');
    el.className   = 'glim-sys';
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollBottom();
  }

  function addLoading() {
    const wrap = document.createElement('div');
    wrap.className = 'glim-msg assistant';
    wrap.innerHTML = '<div class="glim-dots"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function scrollBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }
  function now()          { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  function saveHistory() {
    try {
      const toSave = chatHistory.filter(m => typeof m.content === 'string').slice(-40);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(toSave));
    } catch (_) {}
  }

  // ── Markdown renderer ──────────────────────────────────────────────────────
  function mdRender(t) {
    let h = t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _l, c) => `<pre><code>${c.trim()}</code></pre>`);
    h = h.replace(/`([^`\n]+)`/g,       '<code>$1</code>');
    h = h.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    h = h.replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>');
    h = h.replace(/\*(.+?)\*/g,         '<em>$1</em>');
    h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^# (.+)$/gm, '<h1>$1</h1>');
    h = h.replace(/((?:^[-*] .+\n?)+)/gm, m =>
      `<ul>${m.trim().split('\n').map(l => `<li>${l.replace(/^[-*] /,'')}</li>`).join('')}</ul>`);
    h = h.replace(/((?:^\d+\. .+\n?)+)/gm, m =>
      `<ol>${m.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /,'')}</li>`).join('')}</ol>`);
    h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return h.split(/\n{2,}/).map(b =>
      /^<(h[1-3]|ul|ol|pre)/.test(b.trim()) ? b : `<p>${b.replace(/\n/g,'<br>')}</p>`
    ).join('\n');
  }

  function stripMarkdown(t) {
    return t
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`\n]+`/g, '')
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*]\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{2,}/g, '. ')
      .trim();
  }

} // end initGlim
