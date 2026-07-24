/**
 * Educational C step tracer — simulates execution with memory + explanations.
 * Works offline in the browser; pairs with real gcc run from server.
 */

const PoolersTracer = (() => {
  function stripComments(code) {
    let out = code;
    out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => (m.includes("STOP") || m.includes("THINK") ? "" : ""));
    out = out.replace(/\/\/.*$/gm, "");
    return out;
  }

  function extractCommentBefore(code, lineIndex) {
    const lines = code.split("\n");
    const blockComments = [];
    let buf = "";
    let inBlock = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("/*")) inBlock = true;
      if (inBlock) {
        buf += line + "\n";
        if (line.includes("*/")) {
          inBlock = false;
          blockComments.push({ endLine: i, text: buf });
          buf = "";
        }
      }
    }
    for (const bc of blockComments) {
      if (bc.endLine === lineIndex - 1 || bc.endLine === lineIndex) {
        const cleaned = bc.text
          .replace(/\/\*+|\*+\//g, "")
          .replace(/\* ?/gm, "")
          .trim();
        if (cleaned.length > 20 && cleaned.length < 500) return cleaned.slice(0, 300);
      }
    }
    const prev = lines[lineIndex - 1];
    if (prev && prev.trim().startsWith("//")) {
      return prev.replace(/\/\/\/?[!?*]?\s*/, "").trim();
    }
    return null;
  }

  // Find EVERY function definition (not prototypes) in the source.
  function findFunctions(lines) {
    const funcs = [];
    const typeRe =
      /^(?:static\s+|inline\s+|const\s+|unsigned\s+|signed\s+)*(?:void|int|char|long|short|float|double|size_t|ssize_t|t_\w+|struct\s+\w+)[\s*]+(\w+)\s*\(/;
    const KEYWORDS = new Set(["if", "while", "for", "switch", "sizeof", "return", "else", "do"]);

    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (!t || t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("#")) continue;

      const m = t.match(typeRe);
      if (!m) continue;
      const name = m[1];
      if (KEYWORDS.has(name)) continue;

      // Determine if this is a definition (has a body `{`) vs a prototype (`;`).
      let openLine = -1;
      for (let j = i; j < lines.length && j < i + 8; j++) {
        const lj = lines[j];
        if (lj.includes("{")) { openLine = j; break; }
        if (lj.includes(";")) { openLine = -1; break; } // prototype
      }
      if (openLine < 0) continue;

      // Brace-match to find the closing line.
      let depth = 0;
      let closeLine = -1;
      for (let j = openLine; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
        }
        if (depth === 0) { closeLine = j; break; }
      }
      if (closeLine < 0) closeLine = lines.length - 1;

      funcs.push({
        name,
        declLine: i,
        openLine,
        bodyStart: openLine + 1,
        bodyEnd: closeLine - 1,
        closeLine,
      });
      i = closeLine; // skip past this function's body
    }
    return funcs;
  }

  // ft_ helpers the server auto-links (so calling them is NOT an error, but we
  // can't step into them because their body isn't in the file).
  const AUTO_HELPERS = new Set([
    "ft_putchar", "ft_putstr", "ft_putendl", "ft_putnbr", "ft_strlen", "ft_swap",
  ]);
  const CALL_KEYWORDS = new Set(["if", "while", "for", "switch", "sizeof", "return", "else", "do"]);

  function findCallsInLine(trimmed) {
    const calls = [];
    const re = /\b([a-zA-Z_]\w*)\s*\(/g;
    let m;
    while ((m = re.exec(trimmed))) {
      if (!CALL_KEYWORDS.has(m[1])) calls.push(m[1]);
    }
    return calls;
  }

  function buildSteps(code) {
    const lines = code.split("\n");
    const funcs = findFunctions(lines);
    const funcByName = {};
    for (const f of funcs) funcByName[f.name] = f;
    const mainFunc = funcByName["main"];

    const steps = [];
    const state = { stack: {}, output: "", heap: {}, callStack: [] };
    const MAX_STEPS = 400;
    const MAX_DEPTH = 10;
    let errored = false;

    if (!mainFunc) {
      steps.push({
        phase: "exec",
        title: "No main() found",
        line: 1,
        code: "(add int main(void) { ... })",
        explain: "Step mode traces from int main. Add a main function to your file.",
        memory: renderMemory(state),
        output: "",
      });
      return steps;
    }

    function pushStep(s) {
      s.depth = Math.max(0, state.callStack.length - 1);
      steps.push(s);
    }

    function findReturnLine(fn) {
      for (let i = fn.bodyStart; i <= fn.bodyEnd; i++) {
        if (/\breturn\b/.test(lines[i])) return i;
      }
      return -1;
    }

    function enterFunction(fn, depth) {
      if (errored || steps.length >= MAX_STEPS) return;
      state.callStack.push(fn.name);

      const isMain = fn.name === "main";
      pushStep({
        phase: isMain ? "start" : "call",
        title: `Enter ${fn.name}()`,
        line: fn.declLine + 1,
        code: lines[fn.declLine].trim(),
        explain: isMain
          ? "Execution starts at main(). The OS loaded the program — the CPU jumps here and creates main's stack frame."
          : `Step into ${fn.name}() — a new stack frame is pushed. Call stack: ${state.callStack.join(" → ")}.`,
        memory: renderMemory(state),
        output: state.output,
      });

      traceBody(fn, depth);

      if (errored) return;

      const retIdx = findReturnLine(fn);
      const caller = state.callStack[state.callStack.length - 2];
      pushStep({
        phase: "return",
        title: `Return from ${fn.name}()`,
        line: (retIdx >= 0 ? retIdx : fn.closeLine) + 1,
        code: retIdx >= 0 ? lines[retIdx].trim() : "}",
        explain: isMain
          ? `main returns → program exits. Total output: ${state.output.length} byte(s).`
          : `${fn.name}() finishes and its stack frame is popped. Control returns to ${caller ? caller + "()" : "the caller"}.`,
        memory: renderMemory(state),
        output: state.output,
      });
      state.callStack.pop();
    }

    const MAX_WHILE_ITER = 8;

    function findBlockRange(lineIndex) {
      // Brace may be on this line or the next few (42-style: while (cond)\n{).
      let openLine = -1;
      for (let j = lineIndex; j < Math.min(lines.length, lineIndex + 3); j++) {
        if (lines[j].includes("{")) { openLine = j; break; }
      }

      // No braces → single-statement body on the next non-empty line.
      if (openLine < 0) {
        let body = lineIndex + 1;
        while (body < lines.length && !lines[body].trim()) body++;
        if (body >= lines.length) body = lineIndex;
        return { bodyStart: body, bodyEnd: body, closeLine: body, hasBraces: false };
      }

      let depth = 0;
      let closeLine = -1;
      for (let j = openLine; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
        }
        if (depth === 0) { closeLine = j; break; }
      }
      if (closeLine < 0) closeLine = lines.length - 1;

      // Same-line block: while (…) { stmt; } — body statements live on openLine.
      if (openLine === closeLine) {
        return { bodyStart: openLine, bodyEnd: openLine, closeLine, hasBraces: true, inline: true };
      }
      return { bodyStart: openLine + 1, bodyEnd: closeLine - 1, closeLine, hasBraces: true, inline: false };
    }

    function extractInlineBlockBody(line, index) {
      const parts = line.match(/\{[^{}]*\}/g);
      if (!parts || index >= parts.length) return "";
      return parts[index].slice(1, -1).trim();
    }

    function traceInlineStatements(inner, lineIndex, depth) {
      if (!inner || /^[{};]*$/.test(inner)) return;
      const saved = lines[lineIndex];
      lines[lineIndex] = inner;
      traceLine(lineIndex, depth);
      lines[lineIndex] = saved;
    }

    function traceInlineBlock(lineIndex, depth, blockIndex) {
      traceInlineStatements(extractInlineBlockBody(lines[lineIndex], blockIndex || 0), lineIndex, depth);
    }

    function findEndOfIfChain(fromCloseLine, limit) {
      let j = fromCloseLine;
      while (j <= limit) {
        const t = lines[j].trim();
        if (!t) { j++; continue; }
        if (/else\b/.test(t)) {
          j = findBlockRange(j).closeLine + 1;
          continue;
        }
        break;
      }
      return j;
    }

    function traceIfElseChain(startLine, depth, limit) {
      let line = startLine;
      let taken = false;

      while (line <= limit && !errored && steps.length < MAX_STEPS) {
        const trimmed = lines[line].trim();
        let condExpr = null;
        let label = "if";

        const ifM = trimmed.match(/^if\s*\(([^)]+)\)/);
        const elseIfM = trimmed.match(/^else\s+if\s*\(([^)]+)\)/);
        const isElse = /^else\b/.test(trimmed) && !elseIfM;

        if (ifM) condExpr = ifM[1];
        else if (elseIfM) { condExpr = elseIfM[1]; label = "else if"; }
        else if (isElse) {
          if (!taken) {
            const block = findBlockRange(line);
            pushStep({
              phase: "exec",
              title: "else branch",
              line: line + 1,
              code: trimmed,
              explain: "All prior if/else-if conditions were false — executing the else branch.",
              memory: renderMemory(state),
              output: state.output,
              highlight: "branch",
            });
            if (block.inline) traceInlineBlock(line, depth, 1);
            else traceBodyRange(block.bodyStart, block.bodyEnd, depth);
          }
          return findEndOfIfChain(findBlockRange(line).closeLine, limit);
        } else break;

        const block = findBlockRange(line);
        const cond = taken ? false : evalCondition(condExpr, state);

        if (cond === true) {
          pushStep({
            phase: "exec",
            title: `${label} condition true`,
            line: line + 1,
            code: trimmed,
            explain: `(${condExpr}) evaluates to true — taking this branch.`,
            memory: renderMemory(state),
            output: state.output,
            highlight: "branch",
          });
          if (block.inline) traceInlineBlock(line, depth);
          else traceBodyRange(block.bodyStart, block.bodyEnd, depth);
          taken = true;
          return findEndOfIfChain(block.closeLine, limit);
        }
        if (cond === false) {
          pushStep({
            phase: "exec",
            title: `${label} condition false`,
            line: line + 1,
            code: trimmed,
            explain: `(${condExpr}) evaluates to false — skipping this branch.`,
            memory: renderMemory(state),
            output: state.output,
          });
          line = block.closeLine + 1;
          continue;
        }

        pushStep({
          phase: "exec",
          title: `${label} condition unknown`,
          line: line + 1,
          code: trimmed,
          explain: `Cannot evaluate (${condExpr}) with current values — showing then-branch heuristically.`,
          memory: renderMemory(state),
          output: state.output,
          highlight: "branch",
        });
        if (block.inline) traceInlineBlock(line, depth);
        else traceBodyRange(block.bodyStart, block.bodyEnd, depth);
        return findEndOfIfChain(block.closeLine, limit);
      }
      return line;
    }

    function traceWhileBlock(startLine, depth, conditionExpr) {
      const block = findBlockRange(startLine);
      let iter = 0;

      while (iter < MAX_WHILE_ITER && !errored && steps.length < MAX_STEPS) {
        const cond = evalCondition(conditionExpr, state);

        if (cond === false) {
          pushStep({
            phase: "exec",
            title: "while condition false",
            line: startLine + 1,
            code: lines[startLine].trim(),
            explain: `(${conditionExpr}) is false — loop body skipped, execution continues after the loop.`,
            memory: renderMemory(state),
            output: state.output,
          });
          return block.closeLine + 1;
        }

        const iterNote = cond === null
          ? `Cannot evaluate (${conditionExpr}) — tracing iteration ${iter + 1} heuristically.`
          : `(${conditionExpr}) is true — iteration ${iter + 1}.`;

        pushStep({
          phase: "exec",
          title: `while loop — iteration ${iter + 1}`,
          line: startLine + 1,
          code: lines[startLine].trim(),
          explain: iterNote,
          memory: renderMemory(state),
          output: state.output,
          highlight: "loop",
        });

        if (block.bodyStart <= block.bodyEnd || block.inline) {
          if (block.inline) traceInlineBlock(startLine, depth);
          else traceBodyRange(block.bodyStart, block.bodyEnd, depth);
        }
        iter++;
      }

      const stillTrue = evalCondition(conditionExpr, state);
      if (stillTrue !== false) {
        pushStep({
          phase: "info",
          title: "loop continues…",
          line: startLine + 1,
          code: lines[startLine].trim(),
          explain: `Traced ${MAX_WHILE_ITER} iteration(s); (${conditionExpr}) would still be true — the loop keeps running until the condition becomes false.`,
          memory: renderMemory(state),
          output: state.output,
          highlight: "loop",
        });
      }

      return block.closeLine + 1;
    }

    function traceLine(i, depth) {
      if (errored || steps.length >= MAX_STEPS) return;

      const trimmed = lines[i].trim();
      if (!trimmed) return;
      if (trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;
      if (/^[{}]+;?\s*$/.test(trimmed)) return;

      const calls = findCallsInLine(trimmed);
      const unknownFt = calls.find((n) => /^ft_/.test(n) && !funcByName[n] && !AUTO_HELPERS.has(n));
      const isReturn = /^return\b/.test(trimmed);

      if (!isReturn) {
        const comment = extractCommentBefore(code, i);
        const effects = applyLine(trimmed, state);
        if (!effects.skip) {
          pushStep({
            phase: effects.phase || "exec",
            title: effects.title || "Execute line",
            line: i + 1,
            code: trimmed,
            explain: effects.explain || comment || defaultExplain(trimmed, state),
            memory: renderMemory(state),
            output: state.output,
            highlight: effects.highlight,
          });
        }
      }

      if (unknownFt) {
        pushStep({
          phase: "error",
          title: `Error: undefined reference to '${unknownFt}'`,
          line: i + 1,
          code: trimmed,
          explain: `${unknownFt}() is called but never defined in this file (and it isn't a standard/libft helper the playground auto-links). The linker aborts with "undefined reference to '${unknownFt}'". Define the function or include the file that does — execution stops here.`,
          memory: renderMemory(state),
          output: state.output,
          highlight: "error",
        });
        errored = true;
        return;
      }

      if (depth < MAX_DEPTH) {
        for (const name of calls) {
          if (errored || steps.length >= MAX_STEPS) return;
          if (!funcByName[name] || name === "main") continue;

          const onStack = state.callStack.filter((n) => n === name).length;
          if (onStack >= 2) {
            pushStep({
              phase: "call",
              title: `Recursive call ${name}() (not expanded)`,
              line: i + 1,
              code: trimmed,
              explain: `${name}() calls itself again. Each call adds another stack frame until the base case is reached, then the frames unwind in reverse. (Deeper frames are collapsed here to keep the trace readable.)`,
              memory: renderMemory(state),
              output: state.output,
            });
            continue;
          }
          enterFunction(funcByName[name], depth + 1);
        }
      }
    }

    function traceBodyRange(start, end, depth) {
      let i = start;
      while (i <= end) {
        if (errored || steps.length >= MAX_STEPS) return;

        const trimmed = lines[i].trim();
        if (!trimmed) { i++; continue; }
        if (trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) { i++; continue; }
        if (/^[{}]+;?\s*$/.test(trimmed)) { i++; continue; }

        if (/^while\s*\(/.test(trimmed)) {
          const wm = trimmed.match(/^while\s*\(([^)]+)\)/);
          if (wm) {
            i = traceWhileBlock(i, depth, wm[1]);
            continue;
          }
        }

        if (/^if\s*\(/.test(trimmed)) {
          i = traceIfElseChain(i, depth, end);
          continue;
        }

        if (/^else\b/.test(trimmed)) {
          i = findEndOfIfChain(i - 1, end);
          continue;
        }

        traceLine(i, depth);
        i++;
      }
    }

    function traceBody(fn, depth) {
      traceBodyRange(fn.bodyStart, fn.bodyEnd, depth);
    }

    enterFunction(mainFunc, 0);

    if (steps.length >= MAX_STEPS && !errored) {
      pushStep({
        phase: "info",
        title: "Trace truncated",
        line: 0,
        code: "…",
        explain: `Stopped after ${MAX_STEPS} steps to keep the walkthrough readable (loops/recursion can go deep).`,
        memory: renderMemory(state),
        output: state.output,
      });
    }

    return steps;
  }

  function defaultExplain(line, state) {
    if (/int\s+\w+\s*=/.test(line)) return "Declare integer on the stack and store a value.";
    if (/char\s+\w+\s*=/.test(line)) return "Declare char (1 byte) — holds ASCII value.";
    if (/=\s*'/.test(line)) return "Character literal — single quotes mean ASCII value, not a string.";
    if (/write\s*\(/.test(line)) return "System call: send bytes to a file descriptor (1 = stdout).";
    if (/ft_putchar/.test(line)) return "Your function sends one byte to the terminal via write(1, &c, 1).";
    if (/ft_ft\s*\(/.test(line)) return "Pass ADDRESS of variable so callee can modify original.";
    if (/\*\w+\s*=/.test(line)) return "Dereference: write through pointer to caller's memory.";
    if (/return/.test(line)) return "Return from function — stack frame popped.";
    return "Execute this statement. Trace memory on paper if unsure.";
  }

  /* Byte size per C type (typical 64-bit Linux). */
  const TYPE_SIZE = {
    char: 1, "unsigned char": 1,
    short: 2, "unsigned short": 2,
    int: 4, "unsigned int": 4, unsigned: 4, float: 4,
    long: 8, "unsigned long": 8, double: 8, size_t: 8, "long long": 8,
  };

  function sizeOf(type) {
    const base = type.replace(/\s*\*+$/, "").replace(/\[.*/, "").trim();
    if (/\*$/.test(type)) return 8; // any pointer
    return TYPE_SIZE[base] || 4;
  }

  function charCodeOfLiteral(lit) {
    // lit is the inside of quotes, e.g. a, \n, \0, \t
    const map = { "\\n": 10, "\\t": 9, "\\0": 0, "\\r": 13, "\\\\": 92, "\\'": 39, '\\"': 34 };
    if (lit in map) return map[lit];
    if (lit.length === 1) return lit.charCodeAt(0);
    if (lit[0] === "\\" && lit.length === 2) return lit.charCodeAt(1);
    return lit.charCodeAt(0);
  }

  function displayChar(code) {
    if (code === 10) return "\\n";
    if (code === 9) return "\\t";
    if (code === 0) return "\\0";
    if (code === 13) return "\\r";
    if (code < 32 || code > 126) return "?";
    return String.fromCharCode(code);
  }

  function substIdentifier(name, state) {
    const v = state.stack[name];
    if (!v) return "NaN";
    if (v.kind === "pointer" || (v.type && /\*/.test(v.type))) {
      if (v.value === "NULL" || v.value === "0" || v.value === "0x0") return "0";
      if (typeof v.value === "string" && v.value.startsWith("0x")) {
        const n = parseInt(v.value.slice(2), 16);
        return String(Number.isFinite(n) && n !== 0 ? n : 1);
      }
      return "1";
    }
    if (typeof v.num === "number") return String(v.num);
    if (v.value === "NULL") return "0";
    return "NaN";
  }

  // Evaluate a simple arithmetic expression using current variable values.
  function evalExpr(expr, state) {
    let e = String(expr).trim().replace(/;$/, "");
    e = e.replace(/'(\\.|[^'])'/g, (_m, ch) => String(charCodeOfLiteral(ch)));
    e = e.replace(/\bNULL\b/g, "0");
    e = e.replace(/[a-zA-Z_]\w*/g, (name) => substIdentifier(name, state));
    if (!/^[-+*/%()\d.\s]*$/.test(e) || e.includes("NaN")) return null;
    try {
      const r = Function('"use strict";return (' + e + ");")();
      return typeof r === "number" && isFinite(r) ? r : null;
    } catch (_) {
      return null;
    }
  }

  // Evaluate if/while conditions: comparisons, !x, truthiness, NULL checks.
  function evalCondition(expr, state) {
    let e = String(expr).trim().replace(/;$/, "");
    e = e.replace(/'(\\.|[^'])'/g, (_m, ch) => String(charCodeOfLiteral(ch)));
    e = e.replace(/\bNULL\b/g, "0");
    e = e.replace(/[a-zA-Z_]\w*/g, (name) => substIdentifier(name, state));
    if (!/^[-+*/%<>!=&|!()\d.\s]+$/.test(e) || e.includes("NaN")) return null;
    try {
      const r = Function('"use strict";return !!(' + e + ");")();
      return typeof r === "boolean" ? r : null;
    } catch (_) {
      return null;
    }
  }

  function setVar(state, name, entry) {
    const prev = state.stack[name];
    entry.addr = (prev && prev.addr) || fakeAddr(name);
    state.stack[name] = entry;
  }

  function applyLine(line, state) {
    const l = line.trim();

    /* ── malloc: int *p = malloc(n);  or  p = malloc(n); ── */
    const mallocDecl = l.match(/^(unsigned\s+)?(int|char|long|short|float|double|void)\s*\*\s*(\w+)\s*=\s*malloc\s*\(\s*(.+?)\s*\)\s*;/);
    if (mallocDecl) {
      const baseType = (mallocDecl[1] || "") + mallocDecl[2];
      return applyMalloc(state, mallocDecl[3], mallocDecl[4], baseType + " *");
    }
    const mallocAssign = l.match(/^(\w+)\s*=\s*malloc\s*\(\s*(.+?)\s*\)\s*;/);
    if (mallocAssign) {
      const prev = state.stack[mallocAssign[1]];
      return applyMalloc(state, mallocAssign[1], mallocAssign[2], prev ? prev.type : "void *");
    }

    /* ── free(ptr); ── */
    const freeCall = l.match(/^free\s*\(\s*(\w+)\s*\)\s*;/);
    if (freeCall) {
      const name = freeCall[1];
      const v = state.stack[name];
      const addr = v && v.value;
      if (addr && state.heap[addr]) {
        const block = state.heap[addr];
        delete state.heap[addr];
        if (v) { v.value = "NULL"; v.note = "freed — must not dereference"; }
        return {
          phase: "memory",
          title: "free heap block",
          explain: `free(${name}) releases ${block.size} byte(s) at ${addr}. ${name} should not be used after free.`,
          highlight: name,
        };
      }
      return {
        phase: "memory",
        title: "free()",
        explain: `free(${name}) — heap block released (or pointer was not tracked).`,
        highlight: name,
      };
    }

    /* ── char / int / float / double ARRAY, e.g. int nums[] = {1, 2, 3}; ── */
    const arrInit = l.match(/^(unsigned\s+)?(int|char|long|short|float|double)\s+(\w+)\s*\[\s*\d*\s*\]\s*=\s*(\{[^}]*\}|"[^"]*")\s*;/);
    if (arrInit) {
      const type = (arrInit[1] || "") + arrInit[2];
      const name = arrInit[3];
      const rhs = arrInit[4];
      if (rhs.startsWith('"')) {
        const str = rhs.slice(1, -1);
        setVar(state, name, {
          type: `${arrInit[2]}[${str.length + 1}]`, kind: "string",
          value: `"${str}"`, size: str.length + 1,
          note: `${str.length} chars + '\\0'`,
        });
        return { phase: "memory", title: "Declare char array (string)", explain: `${name}[] holds "${str}" — ${str.length} characters plus a terminating '\\0' (${str.length + 1} bytes).`, highlight: name };
      }
      const items = rhs.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
      const each = sizeOf(arrInit[2]);
      setVar(state, name, {
        type: `${type}[${items.length}]`, kind: "array",
        value: `{${items.join(", ")}}`, size: each * items.length,
        note: `${items.length} × ${each}B`,
      });
      return { phase: "memory", title: "Declare array", explain: `${name} is an array of ${items.length} ${arrInit[2]}s → ${each * items.length} bytes contiguous on the stack.`, highlight: name };
    }

    /* ── char buffer: char name[N]; (uninitialized) ── */
    const bufDecl = l.match(/^(unsigned\s+)?(int|char|long|short|float|double)\s+(\w+)\s*\[\s*(\d+)\s*\]\s*;/);
    if (bufDecl) {
      const each = sizeOf(bufDecl[2]);
      const n = parseInt(bufDecl[4], 10);
      setVar(state, bufDecl[3], { type: `${bufDecl[2]}[${n}]`, kind: "array", value: "(uninitialized)", size: each * n, note: `${n} × ${each}B, garbage` });
      return { phase: "memory", title: "Declare buffer", explain: `${bufDecl[3]} reserves ${each * n} bytes on the stack. Contents are garbage until you write to them.`, highlight: bufDecl[3] };
    }

    /* ── string pointer: char *s = "hello"; ── */
    const strPtr = l.match(/^(const\s+)?char\s*\*\s*(\w+)\s*=\s*"([^"]*)"\s*;/);
    if (strPtr) {
      const name = strPtr[2];
      const str = strPtr[3];
      setVar(state, name, { type: "char *", kind: "string", value: `"${str}"`, size: 8, note: `→ ${str.length + 1} bytes in read-only data` });
      return { phase: "memory", title: "Declare string pointer", explain: `${name} is a pointer (8 bytes) holding the ADDRESS of the string literal "${str}" (${str.length + 1} bytes incl '\\0').`, highlight: name };
    }

    /* ── pointer: int *p = &x;  or  = NULL; ── */
    const ptrDecl = l.match(/^(unsigned\s+)?(int|char|long|short|float|double|void)\s*\*\s*(\w+)\s*=\s*(&\w+|NULL|0)\s*;/);
    if (ptrDecl) {
      const type = (ptrDecl[1] || "") + ptrDecl[2] + " *";
      const name = ptrDecl[3];
      const target = ptrDecl[4];
      let value, note;
      if (target === "NULL" || target === "0") { value = "NULL"; note = "points to nothing (0x0)"; }
      else {
        const tv = state.stack[target.slice(1)];
        value = tv ? tv.addr : "0x????????";
        note = `→ address of ${target.slice(1)}`;
      }
      setVar(state, name, { type, kind: "pointer", value, size: 8, note });
      return { phase: "memory", title: "Declare pointer", explain: `${name} stores an ADDRESS (8 bytes). ${target === "NULL" || target === "0" ? "It is NULL — dereferencing it crashes." : `It points at ${target.slice(1)}.`}`, highlight: name };
    }

    /* ── char scalar: char c = 'A'; ── */
    const chDecl = l.match(/^(unsigned\s+)?char\s+(\w+)\s*=\s*'(\\.|[^'])'\s*;/);
    if (chDecl) {
      const name = chDecl[2];
      const code = charCodeOfLiteral(chDecl[3]);
      setVar(state, name, { type: "char", kind: "char", value: `'${displayChar(code)}'`, num: code, ascii: code, size: 1, note: `ASCII ${code} (0x${code.toString(16).toUpperCase()})` });
      return { phase: "memory", title: "Declare char", explain: `${name} = '${displayChar(code)}' → stored as the number ${code} in 1 byte.`, highlight: name };
    }

    /* ── integer-family scalar: int x = 5;  (also from expression) ── */
    const numDecl = l.match(/^(unsigned\s+)?(int|long|short|size_t)\s+(\w+)\s*=\s*(.+?)\s*;/);
    if (numDecl) {
      const type = (numDecl[1] || "") + numDecl[2];
      const name = numDecl[3];
      const val = evalExpr(numDecl[4], state);
      setVar(state, name, { type, kind: "int", value: val === null ? numDecl[4] : val, num: val === null ? undefined : val, size: sizeOf(numDecl[2]), note: `${sizeOf(numDecl[2])} bytes` });
      return { phase: "memory", title: "Declare integer", explain: `${name} = ${val === null ? numDecl[4] : val} stored on the stack (${sizeOf(numDecl[2])} bytes).`, highlight: name };
    }

    /* ── float / double scalar ── */
    const fDecl = l.match(/^(float|double)\s+(\w+)\s*=\s*([-\d.]+)\s*;/);
    if (fDecl) {
      setVar(state, fDecl[2], { type: fDecl[1], kind: "float", value: fDecl[3], num: parseFloat(fDecl[3]), size: sizeOf(fDecl[1]), note: `${sizeOf(fDecl[1])} bytes` });
      return { phase: "memory", title: `Declare ${fDecl[1]}`, explain: `${fDecl[2]} = ${fDecl[3]} (${sizeOf(fDecl[1])} bytes, floating point).`, highlight: fDecl[2] };
    }

    /* ── declaration without init: int x; ── */
    const bareDecl = l.match(/^(unsigned\s+)?(int|char|long|short|float|double|size_t)\s+(\w+)\s*;/);
    if (bareDecl) {
      const type = (bareDecl[1] || "") + bareDecl[2];
      setVar(state, bareDecl[3], { type, kind: bareDecl[2] === "char" ? "char" : "int", value: "(uninitialized)", size: sizeOf(bareDecl[2]), note: "garbage until set" });
      return { phase: "memory", title: "Declare variable", explain: `${bareDecl[3]} reserves ${sizeOf(bareDecl[2])} bytes but holds garbage until assigned.`, highlight: bareDecl[3] };
    }

    /* ── ft_putchar output ── */
    const putchar = l.match(/ft_putchar\s*\(\s*('(?:\\.|[^'])'|[^)]+)\s*\)/);
    if (putchar) {
      let code;
      const arg = putchar[1].trim();
      if (arg.startsWith("'")) code = charCodeOfLiteral(arg.slice(1, -1));
      else {
        const v = evalExpr(arg, state);
        code = v === null ? "?".charCodeAt(0) : ((v % 256) + 256) % 256;
      }
      const ch = String.fromCharCode(code);
      state.output += ch;
      return {
        phase: "io",
        title: "Output character",
        explain: `write(1, &c, 1) → prints '${displayChar(code)}' (ASCII ${code}). Output so far: "${escapeStr(state.output)}"`,
        highlight: "stdout",
      };
    }

    /* ── pass by address: ft_xxx(&var) ── */
    const callFt = l.match(/(\w+)\s*\(\s*&(\w+)/);
    if (callFt && state.stack[callFt[2]]) {
      return {
        phase: "call",
        title: `Pass &${callFt[2]} by address`,
        explain: `&${callFt[2]} is the ADDRESS (${state.stack[callFt[2]].addr}). The callee can modify ${callFt[2]} in this frame through the pointer.`,
        highlight: callFt[2],
      };
    }

    /* ── write through pointer: *p = value; ── */
    const deref = l.match(/^\*\s*(\w+)\s*=\s*(.+?)\s*;/);
    if (deref) {
      const val = evalExpr(deref[2], state);
      return {
        phase: "memory",
        title: "Write through pointer",
        explain: `*${deref[1]} = ${val === null ? deref[2] : val}: writes ${val === null ? deref[2] : val} at the address stored in ${deref[1]}. The pointed-to variable changes.`,
        highlight: deref[1],
      };
    }

    /* ── reassignment: name = expr;  (name already declared) ── */
    const reassign = l.match(/^(\w+)\s*([-+*/%]?)=\s*(.+?)\s*;/);
    if (reassign && state.stack[reassign[1]]) {
      const name = reassign[1];
      const op = reassign[2];
      const v = state.stack[name];
      let expr = reassign[3];
      if (op) expr = `${name} ${op} (${expr})`; // += -= etc.
      const val = evalExpr(expr, state);
      if (val !== null) {
        if (v.kind === "char") {
          const code = ((Math.trunc(val) % 256) + 256) % 256;
          v.num = code; v.ascii = code; v.value = `'${displayChar(code)}'`; v.note = `ASCII ${code} (0x${code.toString(16).toUpperCase()})`;
        } else {
          v.num = val; v.value = val;
        }
        return { phase: "memory", title: "Update variable", explain: `${name} ${op}= ... → now ${v.kind === "char" ? v.value + ` (ASCII ${v.num})` : val}.`, highlight: name };
      }
      v.value = reassign[3];
      return { phase: "memory", title: "Update variable", explain: `${name} is reassigned.`, highlight: name };
    }

    if (/return\s*\(?\s*0\s*\)?/.test(l) && /main/.test(state.callStack[state.callStack.length - 1] || "")) {
      return { phase: "end", title: "Return 0", explain: "Exit status 0 → the OS reports success." };
    }

    return {};
  }

  function applyMalloc(state, name, sizeExpr, type) {
    const sizeVal = evalExpr(sizeExpr, state);
    const size = sizeVal === null ? sizeExpr : sizeVal;
    const addr = fakeHeapAddr(name);
    state.heap[addr] = { name, size, addr };
    setVar(state, name, {
      type: type.replace(/\s+\*/, " *") || "void *",
      kind: "pointer",
      value: addr,
      size: 8,
      note: `heap ${size} byte(s) at ${addr}`,
    });
    return {
      phase: "memory",
      title: "malloc",
      explain: `${name} = malloc(${sizeExpr}) → ${size} byte(s) allocated on the heap at ${addr}.`,
      highlight: name,
    };
  }

  function fakeAddr(name) {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
    return "0x7ffd" + h.toString(16).padStart(4, "0");
  }

  function fakeHeapAddr(name) {
    let h = 0;
    for (const c of name) h = (h * 37 + c.charCodeAt(0)) & 0xffffff;
    return "0x6020" + h.toString(16).padStart(4, "0");
  }

  function renderMemory(state) {
    const entries = Object.entries(state.stack);
    const heapEntries = Object.entries(state.heap);
    const W = { name: 8, type: 10, value: 14, size: 4 };
    for (const [name, v] of entries) {
      W.name = Math.max(W.name, name.length);
      W.type = Math.max(W.type, String(v.type || "").length);
      W.value = Math.max(W.value, String(v.value).length);
      W.size = Math.max(W.size, String(v.size || "").length + 1);
    }
    W.name = Math.min(W.name, 14);
    W.type = Math.min(W.type, 12);
    W.value = Math.min(W.value, 22);

    const pad = (s, n) => {
      s = String(s);
      if (s.length > n) s = s.slice(0, n - 1) + "…";
      return s.padEnd(n);
    };
    const line = (l, m, r) => `${l}${"─".repeat(W.name + 2)}${m}${"─".repeat(W.type + 2)}${m}${"─".repeat(W.value + 2)}${m}${"─".repeat(W.size + 2)}${r}`;

    const rows = [];
    const callLabel = state.callStack.length ? state.callStack.join(" → ") : "(none)";
    rows.push(`Call stack: ${callLabel}`);
    rows.push("");
    rows.push("STACK  ( most recent on top )");
    rows.push(line("┌", "┬", "┐"));
    rows.push(`│ ${pad("name", W.name)} │ ${pad("type", W.type)} │ ${pad("value", W.value)} │ ${pad("size", W.size)} │`);
    rows.push(line("├", "┼", "┤"));

    if (!entries.length) {
      rows.push(`│ ${pad("(empty)", W.name)} │ ${pad("", W.type)} │ ${pad("no locals yet", W.value)} │ ${pad("", W.size)} │`);
    } else {
      for (const [name, v] of entries.slice().reverse()) {
        rows.push(`│ ${pad(name, W.name)} │ ${pad(v.type || "", W.type)} │ ${pad(v.value, W.value)} │ ${pad((v.size ? v.size + "B" : ""), W.size)} │`);
      }
    }
    rows.push(line("└", "┴", "┘"));

    if (heapEntries.length) {
      rows.push("");
      rows.push("HEAP  ( dynamically allocated )");
      rows.push(line("┌", "┬", "┐"));
      rows.push(`│ ${pad("addr", W.name)} │ ${pad("owner", W.type)} │ ${pad("size", W.value)} │ ${pad("", W.size)} │`);
      rows.push(line("├", "┼", "┤"));
      for (const [addr, block] of heapEntries) {
        rows.push(`│ ${pad(addr, W.name)} │ ${pad(block.name, W.type)} │ ${pad(String(block.size) + "B", W.value)} │ ${pad("", W.size)} │`);
      }
      rows.push(line("└", "┴", "┘"));
    }

    const noted = entries.filter(([, v]) => v.note).slice(-4).reverse();
    if (noted.length) {
      rows.push("");
      for (const [name, v] of noted) rows.push(`• ${name}: ${v.note}`);
    }

    rows.push("");
    rows.push(`stdout: "${escapeStr(state.output)}"  (${state.output.length} byte${state.output.length === 1 ? "" : "s"})`);
    return rows.join("\n");
  }

  function escapeStr(s) {
    return s.replace(/\n/g, "\\n").replace(/\t/g, "\\t");
  }

  function buildCompileSteps() {
    return [
      {
        phase: "compile",
        title: "1. Preprocess",
        code: "cpp main.c → expanded source",
        explain: "#include lines are replaced with actual headers (e.g. unistd.h for write).",
      },
      {
        phase: "compile",
        title: "2. Compile",
        code: "gcc -S → assembly",
        explain: "C is translated to assembly instructions the CPU understands.",
      },
      {
        phase: "compile",
        title: "3. Assemble & Link",
        code: "gcc -o program main.c",
        explain: "Object code is linked into an executable your OS can load.",
      },
    ];
  }

  return { buildSteps, buildCompileSteps };
})();

if (typeof module !== "undefined") module.exports = PoolersTracer;
