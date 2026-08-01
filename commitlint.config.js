const CLOSING_KW = /^(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+/i;

const plugin = {
  rules: {
    // Rule 1: no #N in subject or body (footer only)
    'no-refs-in-subject-body': ({ subject, body }) => {
      for (const [field, text] of [['subject', subject], ['body', body]]) {
        if (text && /#\d+/.test(text)) {
          return [false, `Issue refs (#N) not allowed in ${field} — use footer only`];
        }
      }
      return [true, ''];
    },

    // Rule 2: body paragraphs start uppercase, end with period
    'body-paragraph-format': ({ body }) => {
      if (!body) return [true, ''];
      for (const para of body.split(/\n\n+/).map(p => p.trim()).filter(Boolean)) {
        if (!/^[A-Z]/.test(para)) return [false, `Body paragraph must start uppercase: "${para.slice(0, 50)}"`];
        if (!para.endsWith('.')) return [false, `Body paragraph must end with period: "${para.slice(-50)}"`];
      }
      return [true, ''];
    },

    // Rule 3: no bare #N in footer without preceding closing keyword
    'footer-no-bare-refs': ({ footer }) => {
      if (!footer) return [true, ''];
      for (const line of footer.split('\n')) {
        let m;
        const re = /#\d+/g;
        while ((m = re.exec(line)) !== null) {
          const before = line.slice(0, m.index);
          // segment between last comma (or line start) and this ref
          const segment = before.slice(Math.max(0, before.lastIndexOf(',') + 1)).trim();
          if (!/^(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)$/i.test(segment)) {
            return [false, `Footer ref ${m[0]} must be preceded by a closing keyword`];
          }
        }
      }
      return [true, ''];
    },
  },
};

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [plugin],
  rules: {
    'no-refs-in-subject-body': [2, 'always'],
    'body-paragraph-format': [2, 'always'],
    'footer-no-bare-refs': [2, 'always'],
  },
};
