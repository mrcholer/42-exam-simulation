/**
 * Poolers Quiz — parse QUIZ.md and render interactive assessments
 */
const PoolersQuiz = (() => {
  const ANSWER_KEY_RE = /^##\s+Answer\s+Key/im;

  function parse(md) {
    const parts = md.split(ANSWER_KEY_RE);
    const body = parts[0] || md;
    const keySection = parts[1] || "";
    const answers = parseAnswerKey(keySection);

    return {
      title: (body.match(/^#\s+(.+)/m) || [])[1] || "Quiz",
      intro: body.match(/^>.+$/m)?.[0]?.replace(/^>\s*/, "") || "",
      mcq: parseMCQ(body),
      tf: parseTF(body),
      answers,
      rawKey: keySection,
      hasKey: keySection.length > 0,
    };
  }

  function parseAnswerKey(text) {
    const answers = { mcq: {}, tf: {} };
    let section = null;
    for (const line of text.split("\n")) {
      if (/###\s+Multiple Choice/i.test(line)) section = "mcq";
      else if (/###\s+True or False/i.test(line)) section = "tf";
      else if (section && /^\|\s*\d+\s*\|/.test(line)) {
        const m = line.match(/^\|\s*(\d+)\s*\|\s*\*\*([A-D]|T|F)\*\*/i);
        if (m) answers[section][m[1]] = m[2].toUpperCase();
      }
    }
    return answers;
  }

  function parseMCQ(body) {
    const mcqSection = body.split(/##\s+True or False/i)[0];
    const blocks = mcqSection.split(/###\s+MCQ\s*/i).slice(1);
    const items = [];

    for (const block of blocks) {
      const numMatch = block.match(/^(\d+)\s*\n/);
      const num = numMatch ? numMatch[1] : String(items.length + 1);
      const lines = block.split("\n").filter((l) => l.trim());
      const questionLines = [];
      const options = [];

      for (const line of lines) {
        if (/^-\s*[A-D]\)/i.test(line)) {
          const om = line.match(/^-\s*([A-D])\)\s*(.+)/i);
          if (om) options.push({ id: om[1].toUpperCase(), text: om[2].trim() });
        } else if (!/^(\d+|---+)$/.test(line.trim()) && !line.startsWith("#")) {
          questionLines.push(line.trim());
        }
      }

      if (questionLines.length && options.length) {
        items.push({ num, question: questionLines.join(" "), options });
      }
    }
    return items;
  }

  function parseTF(body) {
    const tfMatch = body.match(/##\s+True or False[\s\S]*?(?=##\s+(?:Coding|Memory|Debugging|Answer|Scoring)|$)/i);
    if (!tfMatch) return [];
    const items = [];
    let n = 0;
    for (const line of tfMatch[0].split("\n")) {
      const m = line.match(/^\d+\.\s+(.+?)\s+\*\*(T|F)\s*\/\s*(T|F)\*\*\s*$/i);
      if (m) {
        n++;
        items.push({ num: String(n), question: m[1].trim() });
      }
    }
    return items;
  }

  function render(container, quiz, opts = {}) {
    container.innerHTML = "";
    const state = { mcq: {}, tf: {}, revealed: false };

    const header = document.createElement("div");
    header.className = "quiz-header";
    header.innerHTML = `
      <h2>${esc(quiz.title)}</h2>
      ${quiz.intro ? `<p class="quiz-intro">${esc(quiz.intro)}</p>` : ""}
      <div class="quiz-toolbar">
        <span class="quiz-score pill" id="quiz-score">0 / ${quiz.mcq.length + quiz.tf.length} answered</span>
        <button type="button" class="btn btn-outline btn-sm" id="quiz-check">Check answers</button>
        <button type="button" class="btn btn-ghost btn-sm" id="quiz-reset">Reset</button>
        ${quiz.hasKey ? `<button type="button" class="btn btn-ghost btn-sm" id="quiz-reveal">Show key</button>` : ""}
      </div>
    `;
    container.appendChild(header);

    const scroll = document.createElement("div");
    scroll.className = "quiz-scroll scroll-area";

    if (quiz.mcq.length) {
      scroll.appendChild(sectionTitle("Multiple Choice", quiz.mcq.length));
      quiz.mcq.forEach((q) => scroll.appendChild(renderMCQ(q, state, quiz.answers)));
    }

    if (quiz.tf.length) {
      scroll.appendChild(sectionTitle("True or False", quiz.tf.length));
      quiz.tf.forEach((q) => scroll.appendChild(renderTF(q, state, quiz.answers)));
    }

    if (!quiz.mcq.length && !quiz.tf.length) {
      scroll.innerHTML = `<div class="quiz-fallback prose">${opts.fallbackHtml || "<p>No interactive questions parsed. Read markdown below.</p>"}</div>`;
    }

    container.appendChild(scroll);

    const keyPanel = document.createElement("div");
    keyPanel.className = "quiz-key-panel scroll-area hidden";
    keyPanel.id = "quiz-key-panel";
    if (quiz.rawKey) keyPanel.innerHTML = marked.parse("## Answer Key" + quiz.rawKey);
    container.appendChild(keyPanel);

    container.querySelector("#quiz-check")?.addEventListener("click", () => {
      state.revealed = true;
      updateScore(container, quiz, state);
      highlightResults(container, quiz, state);
      if (typeof opts.onScore === "function") {
        const total = quiz.mcq.length + quiz.tf.length;
        let correct = 0;
        quiz.mcq.forEach((q) => { if (state.mcq[q.num] === quiz.answers.mcq?.[q.num]) correct++; });
        quiz.tf.forEach((q) => { if (state.tf[q.num] === quiz.answers.tf?.[q.num]) correct++; });
        opts.onScore(correct, total);
      }
    });

    container.querySelector("#quiz-reset")?.addEventListener("click", () => {
      container.querySelectorAll("input").forEach((i) => { i.checked = false; });
      container.querySelectorAll(".quiz-item").forEach((el) => el.classList.remove("correct", "wrong"));
      state.mcq = {};
      state.tf = {};
      state.revealed = false;
      updateScore(container, quiz, state);
    });

    container.querySelector("#quiz-reveal")?.addEventListener("click", () => {
      keyPanel.classList.toggle("hidden");
    });

    container.addEventListener("change", (e) => {
      if (e.target.name?.startsWith("mcq-")) {
        state.mcq[e.target.name.replace("mcq-", "")] = e.target.value;
      }
      if (e.target.name?.startsWith("tf-")) {
        state.tf[e.target.name.replace("tf-", "")] = e.target.value;
      }
      updateScore(container, quiz, state);
    });
  }

  function sectionTitle(title, count) {
    const h = document.createElement("h3");
    h.className = "quiz-section-title";
    h.textContent = `${title} (${count})`;
    return h;
  }

  function renderMCQ(q, state, answers) {
    const el = document.createElement("div");
    el.className = "quiz-item";
    el.dataset.num = q.num;
    el.innerHTML = `<p class="quiz-q"><span class="quiz-num">Q${q.num}</span> ${esc(q.question)}</p>`;
    const opts = document.createElement("div");
    opts.className = "quiz-options";
    for (const o of q.options) {
      const label = document.createElement("label");
      label.className = "quiz-option";
      label.innerHTML = `
        <input type="radio" name="mcq-${q.num}" value="${o.id}" />
        <span class="quiz-opt-id">${o.id}</span>
        <span class="quiz-opt-text">${esc(o.text)}</span>
      `;
      opts.appendChild(label);
    }
    el.appendChild(opts);
    if (answers.mcq?.[q.num]) {
      el.dataset.answer = answers.mcq[q.num];
    }
    return el;
  }

  function renderTF(q, state, answers) {
    const el = document.createElement("div");
    el.className = "quiz-item";
    el.dataset.num = q.num;
    el.innerHTML = `
      <p class="quiz-q"><span class="quiz-num">Q${q.num}</span> ${esc(q.question)}</p>
      <div class="quiz-tf">
        <label class="quiz-option"><input type="radio" name="tf-${q.num}" value="T" /><span>True</span></label>
        <label class="quiz-option"><input type="radio" name="tf-${q.num}" value="F" /><span>False</span></label>
      </div>
    `;
    if (answers.tf?.[q.num]) el.dataset.answer = answers.tf[q.num];
    return el;
  }

  function updateScore(container, quiz, state) {
    const total = quiz.mcq.length + quiz.tf.length;
    const answered = Object.keys(state.mcq).length + Object.keys(state.tf).length;
    const scoreEl = container.querySelector("#quiz-score");
    if (!scoreEl) return;

    if (state.revealed) {
      let correct = 0;
      quiz.mcq.forEach((q) => { if (state.mcq[q.num] === quiz.answers.mcq?.[q.num]) correct++; });
      quiz.tf.forEach((q) => { if (state.tf[q.num] === quiz.answers.tf?.[q.num]) correct++; });
      scoreEl.textContent = `${correct} / ${total} correct`;
      scoreEl.className = correct >= total * 0.8 ? "quiz-score pill pill-success" : "quiz-score pill pill-error";
    } else {
      scoreEl.textContent = `${answered} / ${total} answered`;
      scoreEl.className = "quiz-score pill";
    }
  }

  function highlightResults(container, quiz, state) {
    container.querySelectorAll(".quiz-item").forEach((el) => {
      const num = el.dataset.num;
      const ans = el.dataset.answer;
      if (!ans) return;
      let picked = el.querySelector('input[name="mcq-' + num + '"]:checked')?.value
        || el.querySelector('input[name="tf-' + num + '"]:checked')?.value;
      el.classList.remove("correct", "wrong");
      if (!picked) el.classList.add("wrong");
      else if (picked.toUpperCase() === ans.toUpperCase()) el.classList.add("correct");
      else el.classList.add("wrong");
    });
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  return { parse, render };
})();
