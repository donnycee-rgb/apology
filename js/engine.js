/* ══════════════════════════════════════════
   ENGINE.JS — Playback, terminal, progress,
               tilt effect, typewriter letter
══════════════════════════════════════════ */

const Engine = (() => {

  let queue       = [];
  let index       = 0;
  let paused      = false;
  let speedFactor = 1;
  let totalNodes  = 0;

  const BASE = {
    afterDate:    400,
    afterSystem:  600,
    betweenOwn:   350,
    typingMin:    1300,
    typingMax:    2400,
    afterIncoming:380,
  };

  /* ── Helpers ─────────────────────────── */
  function delay(ms) {
    return new Promise(resolve => {
      if (speedFactor === 0) return resolve();
      setTimeout(resolve, ms / speedFactor);
    });
  }

  function typingDelay() {
    if (speedFactor === 0) return Promise.resolve();
    const ms = BASE.typingMin + Math.random() * (BASE.typingMax - BASE.typingMin);
    return new Promise(resolve => setTimeout(resolve, ms / speedFactor));
  }

  /* ── Progress Bar ────────────────────── */
  function updateProgress() {
    const pct = totalNodes > 0 ? Math.round((index / totalNodes) * 100) : 0;
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct + '%';
  }

  /* ── Tilt Effect (mobile gyroscope) ─── */
  function initTilt() {
    if (!window.DeviceOrientationEvent) return;
    window.addEventListener('deviceorientation', (e) => {
      const bg = document.getElementById('chat-container');
      if (!bg) return;
      const x = Math.max(-8, Math.min(8, e.gamma || 0));
      const y = Math.max(-8, Math.min(8, (e.beta || 0) - 45));
      bg.style.backgroundPosition = `${50 + x * 0.5}% ${50 + y * 0.5}%`;
    });
    // Also request permission on iOS 13+
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(() => {});
    }
  }

  /* ── Terminal Intro ──────────────────── */
  function runTerminal(onDone) {
    const lines = [
      '> initialising memory_log.exe...',
      '> loading chats: April 3 – April 18 ████████ 100%',
      '> compiling: 3 apology notes attached',
      '> destination: jacky.heart ✓',
    ];

    const els = [
      document.getElementById('tl-1'),
      document.getElementById('tl-2'),
      document.getElementById('tl-3'),
      document.getElementById('tl-4'),
    ];

    let li = 0;

    function typeLine() {
      if (li >= lines.length) {
        // All lines typed — pause then show card
        setTimeout(() => {
          const loader = document.getElementById('terminal-loader');
          const card   = document.getElementById('intro-card');
          if (loader) loader.style.transition = 'opacity 0.5s ease';
          if (loader) loader.style.opacity    = '0';
          setTimeout(() => {
            if (loader) loader.style.display = 'none';
            if (card)   card.classList.remove('hidden');
          }, 500);
          onDone();
        }, 600);
        return;
      }

      const el   = els[li];
      const text = lines[li];
      let ci     = 0;
      el.textContent = '';

      const interval = setInterval(() => {
        el.textContent += text[ci];
        ci++;
        if (ci >= text.length) {
          clearInterval(interval);
          li++;
          setTimeout(typeLine, 300);
        }
      }, 28);
    }

    typeLine();
  }

  /* ── Typewriter Letter ───────────────── */
  const LETTER_PARAGRAPHS = [
    "Jacky.",
    "I know you didn't want to look at my phone. So I built this instead — because some things deserve more than a rushed explanation in a moment of tension. You deserve clarity. You deserve the full picture.",
    "That night, April 18th — I was venting to Ivy about us. About you. About whether I was even the right person to be in your life the way I want to be. You walked in on a conversation that, out of context, looked like everything it wasn't. Ivy was helping me figure out how to be better — for you. Nothing more.",
    "When you asked to see the chats and I said no — that wasn't guilt. That was embarrassment. Because it looked terrible and I panicked instead of just being honest. I was sitting there talking about how much I care about you, and then in the same moment I refused to show you proof of that. I understand how that landed.",
    "I was actually on your side that whole conversation. Pushing for something good for us. And then everything collapsed in the worst possible timing — and instead of explaining myself calmly, I shut down. That's on me.",
    "You are not a misunderstanding I'm trying to escape. You are someone I actually want to fight for, not with. And if I've made you feel otherwise — I understand if you're hurt. Ninakuelewa.",
    "I'm not asking you to forget it. I'm asking for a chance to show you who I actually am when I'm not panicking."
  ];

  const LETTER_SIGN = "Yours, even when I'm being an idiot, <strong>Cira 💙</strong>";

  function typewriterLetter(onDone) {
    const container = document.getElementById('letter-body');
    if (!container) { onDone(); return; }
    container.innerHTML = '';

    let pi = 0;

    function typeNextParagraph() {
      if (pi >= LETTER_PARAGRAPHS.length) {
        // Sign-off
        const sign = document.createElement('p');
        sign.className = 'letter-sign';
        sign.innerHTML = LETTER_SIGN;
        container.appendChild(sign);
        setTimeout(onDone, 600);
        return;
      }

      const p  = document.createElement('p');
      // Add special class for first paragraph
      if (pi === 0) p.style.fontWeight = '500';
      container.appendChild(p);

      const cursor = document.createElement('span');
      cursor.className = 'tw-cursor';
      p.appendChild(cursor);

      const text = LETTER_PARAGRAPHS[pi];
      let ci = 0;
      const speed = speedFactor === 0 ? 0 : Math.max(4, 18 / speedFactor);

      const interval = setInterval(() => {
        p.insertBefore(document.createTextNode(text[ci]), cursor);
        ci++;
        container.parentElement && (container.parentElement.scrollTop = container.parentElement.scrollHeight);
        if (ci >= text.length) {
          clearInterval(interval);
          p.removeChild(cursor);
          pi++;
          const gap = speedFactor === 0 ? 0 : 280;
          setTimeout(typeNextParagraph, gap);
        }
      }, speed);
    }

    typeNextParagraph();
  }

  /* ── Main Playback Queue ─────────────── */
  async function processNext() {
    if (paused || index >= queue.length) {
      if (index >= queue.length) {
        await delay(700);
        showFinalScreen();
      }
      return;
    }

    const node = queue[index++];
    updateProgress();

    switch (node.type) {
      case 'date':
        UI.renderDate(node.text);
        await delay(BASE.afterDate);
        break;

      case 'system':
        UI.renderSystem(node.text);
        await delay(BASE.afterSystem);
        break;

      case 'message':
        if (node.direction === 'incoming') {
          UI.showTyping();
          await typingDelay();
          UI.hideTyping();
          UI.renderMessage(node);
          await delay(BASE.afterIncoming);
        } else {
          UI.renderMessage(node);
          await delay(BASE.betweenOwn);
        }
        break;

      case 'apology':
        paused = true;
        UI.showApology(node.text, () => {
          paused = false;
          processNext();
        });
        return;
    }

    processNext();
  }

  /* ── Final Screen Flow ───────────────── */
  function showFinalScreen() {
    // Fill progress to 100%
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = '100%';

    UI.showScreen('final-screen');

    // Start typewriter after screen fades in
    setTimeout(() => {
      typewriterLetter(() => {
        // Reveal tomorrow box
        const box = document.getElementById('tomorrow-box');
        if (box) box.classList.add('visible');

        // Reveal button
        setTimeout(() => {
          const resp = document.getElementById('response-section');
          if (resp) resp.classList.add('visible');
        }, 500);
      });
    }, 500);
  }

  /* ── Init ────────────────────────────── */
  function init() {
    queue      = Parser.parse(CONVERSATION);
    totalNodes = queue.length;
    index      = 0;
    paused     = false;

    // Speed control
    UI.initSpeedControl((s) => { speedFactor = s; });

    // Forgive button (single — no escape route)
    document.getElementById('btn-forgive').addEventListener('click', () => {
      Notify.send('💙 Yes, you can — she said yes.');
    });

    // Terminal → then show intro card
    runTerminal(() => {
      // Terminal done — btn-start is now visible
      document.getElementById('btn-start').addEventListener('click', () => {
        const music = document.getElementById('bg-music');
        if (music) {
          music.volume = 0.16;
          music.play().catch(() => {});
        }
        initTilt();
        UI.showScreen('chat-screen');
        setTimeout(() => processNext(), 650);
      });
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => Engine.init());