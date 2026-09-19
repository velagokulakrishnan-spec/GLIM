// Glim — Content Script Bootstrap
// Loads sidebar.html + sidebar.css into a Shadow DOM host,
// then exposes the root and shadow for sidebar.js to initialise.
(async function glimBoot() {
  'use strict';

  // Guard: only one Glim instance per page
  if (document.getElementById('glim-root')) return;

  // Remove any legacy host elements from older versions
  for (const id of ['glim-host-v5', 'glim-host-v4', 'glim-host-v3']) {
    document.getElementById(id)?.remove();
  }

  // Create shadow host — a plain div at the top level so the Shadow DOM
  // is completely isolated from the host page's styles and scripts.
  const root  = document.createElement('div');
  root.id     = 'glim-root';
  root.style.cssText = 'all:initial;position:fixed;z-index:2147483647;pointer-events:none;';
  document.body.appendChild(root);

  const shadow = root.attachShadow({ mode: 'open' });

  // Fetch the HTML template and CSS from extension resources.
  // Both files are declared in web_accessible_resources in manifest.json.
  try {
    const [html, css] = await Promise.all([
      fetch(chrome.runtime.getURL('sidebar.html')).then(r => {
        if (!r.ok) throw new Error(`sidebar.html fetch failed: ${r.status}`);
        return r.text();
      }),
      fetch(chrome.runtime.getURL('sidebar.css')).then(r => {
        if (!r.ok) throw new Error(`sidebar.css fetch failed: ${r.status}`);
        return r.text();
      }),
    ]);

    shadow.innerHTML = `<style>${css}</style>${html}`;
  } catch (err) {
    console.error('[Glim] Failed to load sidebar resources:', err);
    root.remove();
    return;
  }

  // Expose for sidebar.js (also a content script that runs right after this one).
  // sidebar.js polls for these globals before initialising.
  window.__glimRoot   = root;
  window.__glimShadow = shadow;
})();
