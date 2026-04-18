/* ══════════════════════════════════════════
   PARSER.JS — Validates and enriches data
   Handles: stickers, emojis, edited tags
══════════════════════════════════════════ */

const Parser = (() => {

  /**
   * Takes raw CONVERSATION array from data.js
   * Returns a clean, enriched queue ready for the engine
   */
  function parse(data) {
    return data.map((item, index) => {
      const node = { ...item, id: index };

      if (node.type === 'message') {
        // Clean edited tags if any slipped through
        node.text = node.text.replace(/<This message was edited>/g, '').trim();

        // Mark sticker nodes cleanly
        if (node.isSticker) {
          node.renderAs = 'sticker';
        } else {
          node.renderAs = 'text';
        }

        // Determine direction
        node.direction = node.sender === 'me' ? 'outgoing' : 'incoming';
      }

      return node;
    });
  }

  return { parse };
})();