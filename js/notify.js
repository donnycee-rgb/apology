/* ══════════════════════════════════════════
   NOTIFY.JS — Silent feedback to Cira
   Using EmailJS (free, no server needed)
   
   SETUP (3 min):
   1. Go to https://emailjs.com → sign up free
   2. Add Email Service (Gmail) → copy Service ID
   3. Create Template with variables:
        {{choice}} — what she clicked
        {{time}}   — when she clicked
   4. Copy Template ID + Public Key
   5. Replace the three PLACEHOLDER values below
══════════════════════════════════════════ */

// ── Your EmailJS credentials ─────────────
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'AbCdEfGhIjKlMnOp'
// ─────────────────────────────────────────

// Load EmailJS SDK
(function loadEmailJS() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  script.onload = () => {
    if (typeof emailjs !== 'undefined') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  };
  document.head.appendChild(script);
})();

/* ── Send notification silently ─────────── */
async function sendNotification(choice) {
  const time = new Date().toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  try {
    if (typeof emailjs !== 'undefined' &&
        EMAILJS_SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
        EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID') {

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        choice: choice,
        time:   time
      });
    } else {
      // Dev mode — log to console instead of failing
      console.log(`[notify] Choice: "${choice}" at ${time}`);
    }
  } catch (err) {
    // Fail silently — she should never see an error
    console.error('[notify] send failed:', err);
  }
}

/* ── Wire up response buttons ───────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-response').forEach(btn => {
    btn.addEventListener('click', async () => {
      const choice = btn.dataset.choice;

      // Disable both buttons immediately
      document.querySelectorAll('.btn-response').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.4';
        b.style.cursor  = 'default';
      });

      // Send silently
      await sendNotification(choice);

      // Show soft confirmation — no technical language
      const sentEl = document.getElementById('response-sent');
      sentEl.classList.remove('hidden');

      // If she picked "We can work through this" — add a heart animation
      if (choice.includes('work through')) {
        sentEl.innerHTML = '<p>He\'s been notified. 💙 Thank you for reading this.</p>';
        launchHearts();
      } else {
        sentEl.innerHTML = '<p>He\'s been notified. He understands. 🤍</p>';
      }
    });
  });
});

/* ── Heart burst animation ──────────────── */
function launchHearts() {
  const colors = ['💙', '💙', '🩵', '💙'];
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.textContent = colors[Math.floor(Math.random() * colors.length)];
      h.style.cssText = `
        position: fixed;
        font-size: ${1 + Math.random()}rem;
        left: ${10 + Math.random() * 80}vw;
        bottom: 10vh;
        pointer-events: none;
        z-index: 9999;
        animation: heartFloat 2s ease forwards;
        opacity: 1;
      `;
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 2200);
    }, i * 120);
  }

  // Inject keyframe once
  if (!document.getElementById('heart-style')) {
    const style = document.createElement('style');
    style.id = 'heart-style';
    style.textContent = `
      @keyframes heartFloat {
        0%   { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-60vh) scale(0.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}