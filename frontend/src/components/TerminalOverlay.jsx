import { useState, useRef, useEffect, useCallback } from 'react';
import './TerminalOverlay.css';

/* ════════════════════════════════════════════════════════════════════════════
   ASCII banner (keep short – will scroll-wrap on mobile)
   ════════════════════════════════════════════════════════════════════════════ */
const BANNER = `
 _____ _____ ____  __  __ ___ _   _    _    _       ____  _   _ ___
|_   _| ____|  _ \\|  \\/  |_ _| \\ | |  / \\  | |     |  _ \\| | | |_ _|
  | | |  _| | |_) | |\\/| || ||  \\| | / _ \\ | |     | |_) | |_| || |
  | | | |___|  _ <| |  | || || |\\  |/ ___ \\| |___  |  __/|  _  || |
  |_| |_____|_| \\_\\_|  |_|___|_| \\_/_/   \\_\\_____| |_|   |_| |_|___|
`.trimStart();

/* ════════════════════════════════════════════════════════════════════════════
   Built-in commands (always available)
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * @typedef {Object} OutputLine
 * @property {string}  text      – plain-text content
 * @property {'default'|'system'|'error'|'success'|'dim'|'info'|'html'} [type]
 */

/**
 * @typedef {Object} CommandDef
 * @property {string}   description        – shown by `help`
 * @property {(args: string[], ctx: CommandContext) => OutputLine[] | string | void} handler
 */

/**
 * @typedef {Object} CommandContext
 * @property {function(OutputLine[]|string):void} print   – append lines to output
 * @property {function():void}                     clear   – clear screen
 * @property {function():void}                     close   – close the terminal
 * @property {Object}                              navigate – react-router navigate
 * @property {string[]}                            history – command history
 */

const builtins = {
  help: {
    description: 'List available commands',
    handler: (_args, ctx) => {
      const all = { ...builtins, ...ctx._userCommands };
      const maxLen = Math.max(...Object.keys(all).map(k => k.length));
      const lines = [
        { text: '  Available commands:', type: 'system' },
        { text: '', type: 'dim' },
      ];
      for (const [name, def] of Object.entries(all)) {
        lines.push({
          text: `  ${name.padEnd(maxLen + 2)} ${def.description || ''}`,
          type: 'default',
        });
      }
      lines.push({ text: '', type: 'dim' });
      lines.push({ text: '  Type a command and press Enter.', type: 'dim' });
      return lines;
    },
  },

  clear: {
    description: 'Clear the terminal screen',
    handler: (_args, ctx) => { ctx.clear(); },
  },

  exit: {
    description: 'Close the terminal',
    handler: (_args, ctx) => { ctx.close(); },
  },

  echo: {
    description: 'Echo text back',
    handler: (args) => args.join(' '),
  },

  history: {
    description: 'Show command history',
    handler: (_args, ctx) => {
      if (ctx.history.length === 0) return '  (no history)';
      return ctx.history.map((h, i) => ({
        text: `  ${String(i + 1).padStart(3)}  ${h}`,
        type: 'dim',
      }));
    },
  },

  date: {
    description: 'Show the current date & time',
    handler: () => `  ${new Date().toLocaleString()}`,
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * <TerminalOverlay>
 *
 * Props:
 *  - open        {boolean}       – whether the overlay is visible
 *  - onClose     {function}      – called when the user exits the terminal
 *  - commands    {Object}        – YOUR custom commands, same shape as builtins
 *  - prompt      {string}        – prompt label (default: '❯')
 *  - welcomeText {string|null}   – shown below the banner
 *  - navigate    {function|null} – react-router `useNavigate()` for goto command
 */
export default function TerminalOverlay({
  open = false,
  onClose,
  commands: userCommands = {},
  prompt = '❯ ',
  welcomeText = 'Welcome to Terminal Phi shell. Type "help" to get started.',
  navigate = null,
}) {
  const [output, setOutput] = useState(/** @type {OutputLine[]} */([]));
  const [inputValue, setInputValue] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [activeHint, setActiveHint] = useState(-1);

  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  // Merge user commands with builtins (user overrides win)
  const allCommands = { ...builtins, ...userCommands };

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll to bottom on new output
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [output]);

  /* ── helpers ─────────────────────────────────────────────────────────── */
  const print = useCallback((lines) => {
    setOutput(prev => {
      const normalized = Array.isArray(lines)
        ? lines.map(l => (typeof l === 'string' ? { text: l, type: 'default' } : l))
        : [{ text: String(lines), type: 'default' }];
      return [...prev, ...normalized];
    });
  }, []);

  const clear = useCallback(() => setOutput([]), []);

  const close = useCallback(() => { onClose?.(); }, [onClose]);

  /* ── execute ─────────────────────────────────────────────────────────── */
  const execute = useCallback((raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Echo the command
    print([{ text: `${prompt}${trimmed}`, type: 'dim' }]);

    // Parse
    const parts = trimmed.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    const ctx = {
      print,
      clear,
      close,
      navigate,
      history: cmdHistory,
      _userCommands: userCommands,
    };

    const cmd = allCommands[name];
    if (!cmd) {
      print([{ text: `  command not found: ${name}`, type: 'error' }]);
      print([{ text: '  Type "help" for available commands.', type: 'dim' }]);
      return;
    }

    try {
      const result = cmd.handler(args, ctx);
      if (result !== undefined && result !== null) {
        if (typeof result === 'string') {
          print([{ text: result, type: 'default' }]);
        } else if (Array.isArray(result)) {
          print(result);
        }
      }
    } catch (err) {
      print([{ text: `  Error: ${err.message}`, type: 'error' }]);
    }
  }, [prompt, allCommands, cmdHistory, userCommands, print, clear, close, navigate]);

  /* ── key handling ────────────────────────────────────────────────────── */
  const handleKeyDown = (e) => {
    // Tab – autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      const partial = inputValue.trim().toLowerCase();
      if (!partial) return;
      const matches = Object.keys(allCommands).filter(k => k.startsWith(partial));
      if (matches.length === 1) {
        setInputValue(matches[0] + ' ');
        setSuggestions([]);
      } else if (matches.length > 1) {
        setSuggestions(matches);
      }
      return;
    }

    // Enter – execute
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue;
      setInputValue('');
      setSuggestions([]);
      setHistoryIdx(-1);
      if (val.trim()) {
        setCmdHistory(prev => [...prev, val.trim()]);
      }
      execute(val);
      return;
    }

    // Arrow up / down – history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCmdHistory(prev => {
        const idx = historyIdx === -1 ? prev.length - 1 : historyIdx - 1;
        if (idx >= 0 && idx < prev.length) {
          setHistoryIdx(idx);
          setInputValue(prev[idx]);
        }
        return prev;
      });
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCmdHistory(prev => {
        const idx = historyIdx + 1;
        if (idx < prev.length) {
          setHistoryIdx(idx);
          setInputValue(prev[idx]);
        } else {
          setHistoryIdx(-1);
          setInputValue('');
        }
        return prev;
      });
      return;
    }

    // Escape – close
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    // Hide autocomplete while typing
    setSuggestions([]);
    setActiveHint(-1);
  };

  const handleSuggestionClick = (cmd) => {
    setInputValue(cmd + ' ');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  /* ── render ──────────────────────────────────────────────────────────── */
  return (
    <div
      className={`terminal-overlay ${open ? 'terminal-overlay--open' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="terminal-titlebar">
        <div className="terminal-titlebar__left">
          <button
            className="terminal-dot terminal-dot--red"
            aria-label="Close terminal"
            onClick={(e) => { e.stopPropagation(); close(); }}
          />
          <button
            className="terminal-dot terminal-dot--yellow"
            aria-label="Minimize"
            onClick={(e) => { e.stopPropagation(); close(); }}
          />
          <button
            className="terminal-dot terminal-dot--green"
            aria-label="Maximize"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <span className="terminal-titlebar__title">terminal-phi — bash</span>
        <span className="terminal-titlebar__shortcut">Ctrl + ` to toggle</span>
      </div>

      {/* Output */}
      <div className="terminal-body" ref={bodyRef}>
        <pre className="terminal-banner" aria-hidden="true">{BANNER}</pre>
        {welcomeText && (
          <p className="terminal-welcome" dangerouslySetInnerHTML={{
            __html: welcomeText.replace(/"help"/g, '<strong>"help"</strong>'),
          }} />
        )}

        {output.map((line, i) => (
          <div
            key={i}
            className={`terminal-line terminal-line--${line.type || 'default'}`}
            {...(line.type === 'html' ? { dangerouslySetInnerHTML: { __html: line.text } } : {})}
          >
            {line.type !== 'html' ? line.text : null}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="terminal-input-row">
        <span className="terminal-prompt">{prompt}</span>
        <input
          ref={inputRef}
          className="terminal-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="type a command..."
        />

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <div className="terminal-autocomplete">
            {suggestions.map((s, i) => (
              <span
                key={s}
                className={`terminal-autocomplete__item ${i === activeHint ? 'terminal-autocomplete__item--active' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleSuggestionClick(s); }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
