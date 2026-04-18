/* ══════════════════════════════════════════
   UI.JS — DOM rendering, WhatsApp elements
══════════════════════════════════════════ */

const UI = (() => {

  const wrap       = () => document.getElementById('messages-wrap');
  const chatBox    = () => document.getElementById('chat-container');
  const typingEl   = () => document.getElementById('typing-indicator');
  const headerSub  = () => document.getElementById('header-sub');

  /* ── Screens ─────────────────────────── */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
      // Small delay so CSS transition fires
      requestAnimationFrame(() => {
        target.classList.add('active');
      });
    }
  }

  /* ── Date Separator ──────────────────── */
  function renderDate(text) {
    const div = document.createElement('div');
    div.className = 'date-separator';
    div.innerHTML = `<span class="date-chip">${text}</span>`;
    wrap().appendChild(div);
    scrollBottom();
  }

  /* ── System Message ──────────────────── */
  function renderSystem(text) {
    const div = document.createElement('div');
    div.className = 'system-message';
    div.textContent = text;
    wrap().appendChild(div);
    scrollBottom();
  }

  /* ── Message Bubble ──────────────────── */
  function renderMessage(node) {
    const row = document.createElement('div');
    row.className = `message-row ${node.direction}`;

    const isSticker = node.renderAs === 'sticker';
    const bubbleClass = isSticker ? 'bubble sticker-bubble' : 'bubble';

    const ticks = node.direction === 'outgoing'
      ? `<span class="bubble-ticks">✓✓</span>`
      : '';

    row.innerHTML = `
      <div class="${bubbleClass}">
        <div class="bubble-text">${escapeHtml(node.text)}</div>
        <div class="bubble-meta">
          <span class="bubble-time">${node.timestamp}</span>
          ${ticks}
        </div>
      </div>
    `;

    wrap().appendChild(row);
    scrollBottom();
  }

  /* ── Typing Indicator ────────────────── */
  function showTyping() {
    const el = typingEl();
    el.classList.remove('hidden');
    headerSub().textContent = 'typing...';
    headerSub().style.color = '#4da6ff';
    scrollBottom();
  }

  function hideTyping() {
    const el = typingEl();
    el.classList.add('hidden');
    headerSub().textContent = 'tap here for contact info';
    headerSub().style.color = '';
  }

  /* ── Apology Modal ───────────────────── */
  function showApology(text, onContinue) {
    const modal   = document.getElementById('apology-modal');
    const textEl  = document.getElementById('apology-text');
    const btn     = document.getElementById('btn-continue');

    // Render newlines as paragraphs
    textEl.innerHTML = text
      .split('\n\n')
      .map(p => `<p style="margin-bottom:0.9rem;line-height:1.7;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    modal.classList.remove('hidden');

    const handler = () => {
      btn.removeEventListener('click', handler);
      modal.classList.add('hiding');
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('hiding');
        onContinue();
      }, 300);
    };

    btn.addEventListener('click', handler);
  }

  /* ── Final Screen ────────────────────── */
  function showFinal() {
    showScreen('final-screen');
  }

  /* ── Speed Control ───────────────────── */
  function initSpeedControl(onSpeedChange) {
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onSpeedChange(parseFloat(btn.dataset.speed));
      });
    });
  }

  /* ── Helpers ─────────────────────────── */
  function scrollBottom() {
    const box = chatBox();
    if (box) box.scrollTop = box.scrollHeight;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    showScreen,
    renderDate,
    renderSystem,
    renderMessage,
    showTyping,
    hideTyping,
    showApology,
    showFinal,
    initSpeedControl,
    scrollBottom
  };
})();