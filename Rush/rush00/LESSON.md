# Rush 00 — ASCII Art Box (`o - |`)

> **1337 / 42 Piscine · Weekend Rush** · Concepts: nested loops, position logic, `ft_putchar`
> Trace `rush(5, 3)` on paper **before** you read the code.

---

## Goal

Write a function that draws a rectangle of any width and height using only
`ft_putchar`. This is the classic first Rush: it looks like art, but it is
really an exercise in **deciding a character from a coordinate**.

```
rush(5, 3):        rush(1, 1):     rush(3, 4):
o---o              o               o-o
|   |                              | |
o---o                              | |
                                   o-o
```

---

## Project layout (norme)

```
rush00/
  Makefile
  ft_putchar.c
  rush00.c      ← void rush(int x, int y);
  main.c
  source.c      ← single-file demo for Playground Step/Run
```

```bash
make && ./rush-00
```

## The Prototype

```c
void	rush(int x, int y);
```

- `x` = width (number of columns)
- `y` = height (number of rows)
- Output goes to **stdout**, one byte at a time, via `ft_putchar`.
- Follow the **42 Norme**: tabs, ≤25 lines/function, ≤5 locals, `while` not `for`.

---

## The Key Idea: Four Positions

Every cell of the grid is exactly one of these:

| Position | When | Character |
|----------|------|-----------|
| Corner | on a side column **and** a top/bottom row | `o` |
| Top / bottom edge | first or last row (not a corner) | `-` |
| Left / right edge | first or last column (not a corner) | `\|` |
| Inside | everything else | space |

The whole program is just this decision, repeated for every cell.

---

## Algorithm

```
for row from 0 to height - 1:
    for col from 0 to width - 1:
        edge_x = (col is first or last column)
        edge_y = (row is first or last row)
        if edge_x and edge_y:  putchar 'o'
        elif edge_y:           putchar '-'
        elif edge_x:           putchar '|'
        else:                  putchar ' '
    putchar '\n'   # end of the row
```

The **outer loop** picks the row, the **inner loop** walks across it. The
newline after the inner loop is what turns a stream of characters into lines.

---

## Memory Diagram (`rush(5, 3)`)

```
Stack ( grows ↓ )
┌──────────┬────────┬──────────────────────────────┐
│ name     │ value  │ notes                         │
├──────────┼────────┼──────────────────────────────┤
│ width    │ 5      │ parameter                     │
│ height   │ 3      │ parameter                     │
│ row      │ 0..2   │ outer loop counter            │
│ col      │ 0..4   │ inner loop counter            │
└──────────┴────────┴──────────────────────────────┘
stdout builds up: "o---o\n|   |\no---o\n"
```

---

## Common Errors

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Forgetting `\n` after each row | Everything on one line | Print `'\n'` after the inner loop |
| Loop to `<= width` | One extra column / crash | Use `col < width` (0-indexed) |
| Corner test wrong | Corners show `-` or `\|` | A corner is `edge_x` **AND** `edge_y` |
| `x` or `y` is 0 or negative | Nothing prints | That is correct — no cells to draw |

---

## Edge Cases to Test

- `rush(1, 1)` → a single `o`
- `rush(5, 1)` → `o---o` (top and bottom are the same row)
- `rush(1, 5)` → a vertical bar of `o` / `|`
- `rush(0, 0)` → prints nothing

---

## Practice (before `source.c`)

1. **Easy:** hand-draw `rush(4, 2)`.
2. **Medium:** change corners to `*` and edges to `#` — which lines change?
3. **Hard:** rewrite `draw_cell` without the helper, inline in `rush`.

---

## Summary

Rush 00 is nested loops plus a 4-way position decision. Once you can map a
`(col, row)` to the right character, every Rush variant is the same code with
different characters.

> Open **QUIZ.md** in the **Quiz** tab, then hit **Run** to see `rush(5, 3)`
> print, and **Step** to watch it draw the box character by character.
