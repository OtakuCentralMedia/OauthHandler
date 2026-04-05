/* ============================================================
   YouTube API OAuth Redirect — Script
   Copyright (c) 2025 Otaku Central. All rights reserved.
   ============================================================ */

(function () {
  'use strict';

  // ── Parse URL params (query string + hash fragment) ──────────────
  const params      = new URLSearchParams(window.location.search);
  const hash        = new URLSearchParams(window.location.hash.replace('#', ''));
  const all         = new URLSearchParams([...params, ...hash]);

  const code        = all.get('code');
  const error       = all.get('error');
  const state       = all.get('state');
  const scope       = all.get('scope');
  const accessToken = all.get('access_token');
  const tokenType   = all.get('token_type');
  const expiresIn   = all.get('expires_in');
  const refreshToken= all.get('refresh_token');

  // ── DOM refs ─────────────────────────────────────────────────────
  const grid    = document.getElementById('paramsGrid');
  const heading = document.getElementById('heading');
  const subtext = document.getElementById('subtext');
  const dot     = document.getElementById('statusDot');
  const stxt    = document.getElementById('statusText');
  const actions = document.getElementById('actions');
  const rawPre  = document.getElementById('rawPre');

  // ── Helpers ──────────────────────────────────────────────────────

  /**
   * Append a labelled param row to the grid.
   * @param {string} label
   * @param {string|null} value
   * @param {string} cls   Extra class for the value element (token | error-val | '')
   */
  function addParam(label, value, cls = '') {
    const d = document.createElement('div');
    d.className = 'param-card';
    d.style.animationDelay = (grid.children.length * 0.07) + 's';
    d.innerHTML = `
      <div class="param-label">${label}</div>
      <div class="param-value ${cls}">${value || '<em class="missing">— not present —</em>'}</div>`;
    grid.appendChild(d);
  }

  /**
   * Truncate a string to n characters, appending an ellipsis if needed.
   * @param {string|null} str
   * @param {number} n
   * @returns {string|null}
   */
  function truncate(str, n = 64) {
    if (!str) return null;
    return str.length > n ? str.slice(0, n) + '…' : str;
  }

  /**
   * Update the status indicator dot and label.
   * @param {'error'|'loading'|''} type
   * @param {string} text
   */
  function setStatus(type, text) {
    dot.className = 'status-dot ' + type;
    stxt.textContent = text;
  }

  /**
   * Append a button to the actions bar.
   * @param {string} label
   * @param {string} cls   btn-primary | btn-secondary
   * @param {Function} cb  Click handler
   */
  function addBtn(label, cls, cb) {
    const b = document.createElement('button');
    b.className = 'btn ' + cls;
    b.textContent = label;
    b.addEventListener('click', cb);
    actions.appendChild(b);
  }

  /**
   * Briefly display a toast notification.
   * @param {string} msg
   */
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ── Raw params accordion (called from inline onclick) ─────────────
  window.toggleRaw = function () {
    document.getElementById('rawBox').classList.toggle('open');
    document.getElementById('rawToggle').classList.toggle('open');
  };

  // ── Populate raw block ────────────────────────────────────────────
  const allEntries = [...all.entries()];
  rawPre.textContent = allEntries.length
    ? allEntries.map(([k, v]) => `${k} = ${v}`).join('\n')
    : '(no parameters found in URL)';

  // ── Main flow detection (slight delay for loading animation) ──────
  setTimeout(function () {

    if (error) {
      // ── Error response ──────────────────────────────────────────
      setStatus('error', 'Authentication failed');
      heading.textContent = 'Authorization denied';
      subtext.textContent = 'The user denied access or an error occurred during the OAuth flow.';

      addParam('Error code',        error,                           'error-val');
      addParam('Error description', all.get('error_description'),    'error-val');
      addParam('State',             state);

      addBtn('Try again',   'btn-primary',   () => history.back());
      addBtn('Copy error',  'btn-secondary', () => {
        navigator.clipboard.writeText(
          JSON.stringify({ error, error_description: all.get('error_description') }, null, 2)
        );
        showToast('Error details copied');
      });

    } else if (accessToken) {
      // ── Implicit grant (token in hash) ──────────────────────────
      setStatus('', 'Token received (implicit flow)');
      heading.textContent = 'Access token received';
      subtext.textContent = 'Implicit grant flow complete. Store this token securely — it will not be issued again.';

      addParam('Access token',  truncate(accessToken), 'token');
      addParam('Token type',    tokenType);
      addParam('Expires in',    expiresIn ? expiresIn + ' seconds' : null);
      addParam('Scope',         scope);
      addParam('State',         state);

      addBtn('Copy token', 'btn-primary', () => {
        navigator.clipboard.writeText(accessToken);
        showToast('Access token copied');
      });
      addBtn('Copy all as JSON', 'btn-secondary', () => {
        navigator.clipboard.writeText(
          JSON.stringify({ accessToken, tokenType, expiresIn, scope, state }, null, 2)
        );
        showToast('Copied as JSON');
      });

    } else if (code) {
      // ── Authorization code flow ─────────────────────────────────
      setStatus('', 'Authorization code received');
      heading.textContent = 'Authorization successful';
      subtext.textContent = 'Exchange this code server-side using your client secret to obtain an access token.';

      addParam('Authorization code', truncate(code, 48), 'token');
      addParam('State',              state);
      addParam('Scope',              scope);

      addBtn('Copy code', 'btn-primary', () => {
        navigator.clipboard.writeText(code);
        showToast('Authorization code copied');
      });
      addBtn('Copy all as JSON', 'btn-secondary', () => {
        navigator.clipboard.writeText(
          JSON.stringify({ code, state, scope }, null, 2)
        );
        showToast('Copied as JSON');
      });

    } else {
      // ── No recognizable params ──────────────────────────────────
      setStatus('error', 'No OAuth parameters found');
      heading.textContent = 'Nothing to parse';
      subtext.textContent = 'No recognizable YouTube OAuth parameters were found in the URL. Make sure this page is set as your redirect URI.';

      addParam('Current URL',     window.location.href);
      addParam('Expected params', 'code, access_token, or error');

      addBtn('Back', 'btn-secondary', () => history.back());
    }

  }, 800);

})();
