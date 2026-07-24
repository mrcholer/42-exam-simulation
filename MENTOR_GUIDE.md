# Mentor Guide — Live Meeting Playbook

## Before Every Session

1. Read the exercise **NOTES.md** (timing script)
2. Open **VISUALS.md** on shared screen
3. Hide **source.c** until students have tried
4. Prepare **QUIZ.md** questions as live polls

---

## Session Structure (60–90 min)

| Phase | Time | Activity |
|-------|------|----------|
| Warm-up | 10 min | 3 quiz questions from previous theory |
| Concept | 15 min | VISUALS.md + board drawing |
| THINK | 10 min | Silent individual work (README algorithm) |
| Discuss | 15 min | Predict output / memory — no code yet |
| LIVE DEMO | 15 min | Compile, break things on purpose |
| Practice | 15 min | EXERCISES.md easy/medium |
| Close | 5 min | Reflection questions from README |

---

## Meeting Blocks in source.c

```
// STOP     → Ask class, wait for answers
// THINK    → Silent work, mentor observes
// LIVE DEMO → Terminal, intentional bugs
```

Never skip STOP blocks — they build prediction muscle.

---

## What NOT to Do

- Do not paste full solutions in chat
- Do not say "just use `%d`" without drawing memory
- Do not let students skip theory for C07 (heap)
- Do not approve "it works" without "explain this line"

---

## Escalation Path When Stuck

1. Student traces on paper
2. Student explains to peer
3. Mentor asks leading memory questions
4. Open COMMON_ERRORS.md together
5. Show **one line** of source.c, not whole file

---

## Module Critical Path

| Must master before advancing | Module |
|------------------------------|--------|
| Theory 01–14 | C00 |
| Theory 16–22 | C01 |
| Theory 26 | C06 |
| Theory 27–33 | C07 |
| Theory 37 | C10 |

---

## Assessment (End of Session)

Student must reach **Level 4** (see CURRICULUM.md rubric):
- Draw memory for the exercise
- Explain without reading code

---

## Repository Maintenance

After each cohort:
- Add new bugs to COMMON_ERRORS.md
- Add real exam questions to Exam/
- Note timing fixes in NOTES.md
