# Rush 02 — ASCII Art Box (`A` left / `C` right corners, `B` edges)

> **1337 / 42 Piscine · Weekend Rush** · Concepts: nested loops, left vs right corners
> One more twist: this time the **left corners differ from the right corners.**

---

## Project layout (norme)

```
rush02/
  Makefile · ft_putchar.c · rush02.c · main.c · source.c
```

```bash
make && ./rush-02
```

## Goal

Same rectangle again. Now the corner character depends on **which column
side** it is on, not which row.

```
rush(5, 3):        rush(1, 1):     rush(3, 4):
ABBBC              A               ABC
B   B                              B B
ABBBC                              B B
                                   ABC
```

---

## The Character Rules

| Position | When | Character |
|----------|------|-----------|
| Left corner | first column **and** top/bottom row | `A` |
| Right corner | last column **and** top/bottom row | `C` |
| Any other edge | first/last row or first/last column | `B` |
| Inside | everything else | space |

Compare with Rush 01: there the corner depended on the **row** (top vs
bottom). Here it depends on the **column** (left vs right).

---

## Algorithm

```
for row from 0 to height - 1:
    for col from 0 to width - 1:
        corner_row = (first or last row)
        if (first column)  and corner_row:  putchar 'A'
        elif (last column) and corner_row:  putchar 'C'
        elif (any edge):                    putchar 'B'
        else:                               putchar ' '
    putchar '\n'
```

Again the **specific corner branches come first**, then the generic edge.

---

## Same Skeleton, Different Decision

All three Rush variants share the exact same loops and newline handling.
Only `draw_cell` changes. If you factor the decision into its own function
(like these examples), swapping variants is a tiny edit — a sign of good
structure.

| Variant | Corner rule |
|---------|-------------|
| Rush 00 | all corners `o` |
| Rush 01 | top `A`, bottom `C` |
| Rush 02 | left `A`, right `C` |

---

## Memory Diagram (`rush(5, 3)`)

```
Stack ( grows ↓ )
┌──────────┬────────┬──────────────────────────────┐
│ name     │ value  │ notes                         │
├──────────┼────────┼──────────────────────────────┤
│ width    │ 5      │ parameter                     │
│ height   │ 3      │ parameter                     │
│ row      │ 0..2   │ outer loop                    │
│ col      │ 0..4   │ 0 → 'A', 4 → 'C' on edge rows │
└──────────┴────────┴──────────────────────────────┘
stdout: "ABBBC\nB   B\nABBBC\n"
```

---

## Common Errors

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Row-based corner logic | Looks like Rush 01 | Corner depends on **column** here |
| Generic edge first | Corners print `B` | Specific branches first |
| `rush(1, y)` | Single column | Every edge cell is a corner → `A` |

---

## Practice

1. **Easy:** hand-draw `rush(6, 4)`.
2. **Medium:** what does `rush(1, 3)` print? (single column)
3. **Hard:** combine rules — top-left `A`, top-right `C`, bottom-left `E`, bottom-right `F`.

---

## Summary

Rush 02 completes the pattern: the loops never change, only the
coordinate → character decision does. Master `draw_cell` and you can produce
any bordered box a subject asks for.

> Open **QUIZ.md** in the **Quiz** tab, then **Run** and **Step** to watch the
> box render.
