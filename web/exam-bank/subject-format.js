/**
 * Beautiful 42-style exam subject markdown.
 * Exercises may come from C piscine days or custom Poolers bank.
 */

function codeBlock(lang, body) {
  const text = String(body || "").replace(/^\n+|\n+$/g, "");
  return "```" + lang + "\n" + text + "\n```";
}

/**
 * @param {object} opts
 */
function renderSubject(opts) {
  const name = opts.name || "exercise";
  const filename = opts.filename || `${name}.c`;
  const day = opts.day || "Poolers";
  const originLabel = opts.origin === "piscine" ? "1337 / 42 piscine day" : "Poolers exam bank";
  let allowed;
  if (!opts.allowed || opts.allowed === "None" || opts.allowed === "none") {
    allowed = "_None_";
  } else if (Array.isArray(opts.allowed)) {
    allowed = opts.allowed.map((a) => `\`${a}\``).join(", ");
  } else {
    allowed = String(opts.allowed)
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((a) => (a.startsWith("`") ? a : `\`${a}\``))
      .join(", ");
  }

  const notes = (opts.notes || []).map((n) => `- ${n}`).join("\n");
  const examples = opts.examples
    ? `\n### Examples\n\n${opts.examples.trim()}\n`
    : "";
  const hint = opts.hint ? `\n> **Tip:** ${opts.hint}\n` : "";

  return `# ${name}

> **${originLabel}** · track \`${day}\` · submit \`${filename}\`

---

## Assignment

${(opts.description || "").trim()}
${hint}
${examples}
---

## Prototype

${codeBlock("c", opts.prototype)}

---

## Allowed functions

${allowed}

---

## Rules

1. Follow the piscine norme (names, braces, tabs).
2. Use **only** the allowed functions listed above.
3. Do **not** include a \`main\` in your file — the grader links its own.
4. Crash / timeout / wrong output ⇒ **KO**.
${notes ? `\n### Notes\n\n${notes}\n` : ""}
---

## Deliverable

One file: **\`${filename}\`** containing the required function(s).
`;
}

module.exports = { renderSubject, codeBlock };
